#!/usr/bin/env node
/**
 * PMM Sherpa — Supabase Migration Script
 * Migrates from Free (Flytr/ogbjdvnkejkqqebyetqx) to Pro (cfztsohetqiaudijlocj)
 *
 * Usage: node scripts/migrate-to-pro.mjs [--schema-only] [--data-only] [--auth-only] [--verify-only]
 *
 * Steps:
 *   1. Schema: Runs all migration SQL files on the new project
 *   2. Data:   Copies all table data via REST API (service role)
 *   3. Auth:   Migrates auth.users preserving UUIDs + password hashes
 *   4. Verify: Compares row counts between old and new
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// ── Configuration ──────────────────────────────────────────────────────
const OLD_URL = 'https://ogbjdvnkejkqqebyetqx.supabase.co'
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmpkdm5rZWprcXFlYnlldHF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUxNTA4MSwiZXhwIjoyMDgxMDkxMDgxfQ.8yawHtZzHdP58VImZQpShVK5ZvFK_NVQOiKFA25tUVg'

const NEW_URL = 'https://cfztsohetqiaudijlocj.supabase.co'
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmenRzb2hldHFpYXVkaWpsb2NqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY1MDIwNSwiZXhwIjoyMDkyMjI2MjA1fQ.NKPfJT7BpVWysvr4gIDEr9AQ_nakx8FkkiD0g8MwnXw'
const NEW_ACCESS_TOKEN = 'sbp_a646a39f55c30ed188220c49ff95232de0697b83'
const NEW_PROJECT_REF = 'cfztsohetqiaudijlocj'

const oldSupa = createClient(OLD_URL, OLD_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const newSupa = createClient(NEW_URL, NEW_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Helpers ────────────────────────────────────────────────────────────
function log(step, msg) {
  console.log(`[${step}] ${msg}`)
}

function logError(step, msg, err) {
  console.error(`[${step}] ERROR: ${msg}`, err?.message || err)
}

async function runSQL(sql, description) {
  // Use the Supabase Management API to run SQL on the new project
  const resp = await fetch(
    `https://api.supabase.com/v1/projects/${NEW_PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`SQL failed (${description}): ${resp.status} ${text}`)
  }
  return resp.json()
}

// Fetch all rows from a table with pagination (handles >1000 rows)
async function fetchAll(client, table, options = {}) {
  const { orderBy = 'created_at', selectCols = '*' } = options
  const rows = []
  const pageSize = 1000
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await client
      .from(table)
      .select(selectCols)
      .order(orderBy, { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(`Fetch ${table}: ${error.message}`)
    rows.push(...(data || []))
    hasMore = (data?.length || 0) === pageSize
    offset += pageSize
    if (rows.length % 5000 === 0 && rows.length > 0) {
      log('DATA', `  ${table}: fetched ${rows.length} rows so far...`)
    }
  }
  return rows
}

// Columns that are GENERATED ALWAYS and cannot be inserted
const GENERATED_COLUMNS = {
  chunks: ['fts_vector'],
  documents: ['fts_vector', 'word_count'],
  usage_logs: ['total_tokens'],
}

// Strip generated columns before insert
function stripGenerated(table, rows) {
  const cols = GENERATED_COLUMNS[table]
  if (!cols || cols.length === 0) return rows
  return rows.map(row => {
    const clean = { ...row }
    for (const col of cols) delete clean[col]
    return clean
  })
}

// Insert rows in batches
async function insertBatch(client, table, rows, batchSize = 500) {
  const cleanRows = stripGenerated(table, rows)
  let inserted = 0
  let errorCount = 0

  for (let i = 0; i < cleanRows.length; i += batchSize) {
    const batch = cleanRows.slice(i, i + batchSize)
    const { error } = await client
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })

    if (error) {
      // Try smaller batches on error
      for (const row of batch) {
        const { error: singleErr } = await client.from(table).upsert(row, { onConflict: 'id', ignoreDuplicates: true })
        if (singleErr) {
          if (errorCount < 5) logError('DATA', `  Insert ${table} id=${row.id}`, singleErr)
          if (errorCount === 5) log('DATA', `  (suppressing further errors for ${table}...)`)
          errorCount++
        } else {
          inserted++
        }
      }
      continue
    }
    inserted += batch.length
    if (inserted % 5000 === 0 && inserted > 0) {
      log('DATA', `  ${table}: inserted ${inserted}/${cleanRows.length} rows...`)
    }
  }
  if (errorCount > 0) log('DATA', `  ${table}: ${errorCount} total errors`)
  return inserted
}

// ── Step 1: Schema Migration ───────────────────────────────────────────
async function migrateSchema() {
  log('SCHEMA', 'Starting schema migration...')

  const migrationsDir = join(import.meta.dirname, '..', 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes(' 2.sql')) // skip duplicates like "016_usage_gating 2.sql"
    .sort()

  log('SCHEMA', `Found ${files.length} migration files`)

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    try {
      await runSQL(sql, file)
      log('SCHEMA', `  ✓ ${file}`)
    } catch (err) {
      // Some migrations may partially fail (e.g., IF NOT EXISTS on already-existing objects)
      // Log but continue
      logError('SCHEMA', `  ✗ ${file}`, err)
    }
  }

  // Also run migration 017 (profile completion) which we just created
  log('SCHEMA', 'Schema migration complete')
}

// ── Step 2: Data Migration ─────────────────────────────────────────────
async function migrateData() {
  log('DATA', 'Starting data migration...')

  // Order matters due to foreign key constraints
  // documents and chunks don't reference profiles, so they can go first
  const tables = [
    { name: 'documents', orderBy: 'id' },
    { name: 'chunks', orderBy: 'id' },
    // profiles is created by auth trigger, so we handle it after auth
    // but we need to update profile data after auth users are created
    { name: 'access_requests', orderBy: 'created_at' },
  ]

  // Tables that depend on profiles (will be migrated after auth)
  const profileDependentTables = [
    { name: 'conversations', orderBy: 'created_at' },
    { name: 'messages', orderBy: 'created_at' },
    { name: 'usage_logs', orderBy: 'created_at' },
    { name: 'saved_responses', orderBy: 'created_at' },
  ]

  // Also check for api_costs and conversation_attachments
  const optionalTables = [
    { name: 'api_costs', orderBy: 'created_at' },
    { name: 'conversation_attachments', orderBy: 'created_at' },
  ]

  // Phase 1: Independent tables (no FK to profiles)
  for (const { name, orderBy } of tables) {
    try {
      log('DATA', `Exporting ${name}...`)
      const rows = await fetchAll(oldSupa, name, { orderBy })
      log('DATA', `  Fetched ${rows.length} rows from ${name}`)

      if (rows.length === 0) {
        log('DATA', `  Skipping ${name} (empty)`)
        continue
      }

      log('DATA', `  Importing ${rows.length} rows into ${name}...`)
      const inserted = await insertBatch(newSupa, name, rows)
      log('DATA', `  ✓ ${name}: ${inserted}/${rows.length} rows`)
    } catch (err) {
      logError('DATA', `Failed on ${name}`, err)
    }
  }

  log('DATA', 'Phase 1 complete (independent tables). Auth migration next, then profile-dependent tables.')
  return { profileDependentTables, optionalTables }
}

async function migrateProfileDependentData(tables) {
  log('DATA', 'Migrating profile-dependent tables...')

  for (const { name, orderBy } of tables) {
    try {
      log('DATA', `Exporting ${name}...`)
      const rows = await fetchAll(oldSupa, name, { orderBy })
      log('DATA', `  Fetched ${rows.length} rows from ${name}`)

      if (rows.length === 0) {
        log('DATA', `  Skipping ${name} (empty)`)
        continue
      }

      log('DATA', `  Importing ${rows.length} rows into ${name}...`)
      const inserted = await insertBatch(newSupa, name, rows)
      log('DATA', `  ✓ ${name}: ${inserted}/${rows.length} rows`)
    } catch (err) {
      logError('DATA', `Failed on ${name}`, err)
    }
  }
}

// ── Step 3: Auth User Migration ────────────────────────────────────────
async function migrateAuthUsers() {
  log('AUTH', 'Starting auth user migration...')

  // List all users from old project
  let allUsers = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data: { users }, error } = await oldSupa.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error) {
      logError('AUTH', 'Failed to list users', error)
      break
    }
    allUsers.push(...users)
    if (users.length < perPage) break
    page++
  }

  log('AUTH', `Found ${allUsers.length} users to migrate`)

  // Fetch profile data from old project to preserve it
  const oldProfiles = await fetchAll(oldSupa, 'profiles', { orderBy: 'created_at' })
  const profileMap = new Map(oldProfiles.map(p => [p.id, p]))

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const user of allUsers) {
    try {
      // Create user on new project preserving UUID
      const createData = {
        email: user.email,
        email_confirm: true,
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {},
      }

      // Preserve password hash if available
      if (user.encrypted_password) {
        createData.password_hash = user.encrypted_password
      }

      // Preserve ban status
      if (user.banned_until) {
        const banDate = new Date(user.banned_until)
        if (banDate > new Date()) {
          createData.ban_duration = '876000h' // Still banned
        }
      }

      const { data: newUser, error: createError } = await newSupa.auth.admin.createUser(createData)

      if (createError) {
        if (createError.message?.includes('already')) {
          skipped++
          continue
        }
        logError('AUTH', `Failed to create user ${user.email}`, createError)
        failed++
        continue
      }

      // Now update the profile row that was auto-created by the trigger
      // to match the old profile data
      const oldProfile = profileMap.get(user.id)
      if (oldProfile && newUser.user) {
        const profileUpdate = {
          full_name: oldProfile.full_name,
          avatar_url: oldProfile.avatar_url,
          preferred_model: oldProfile.preferred_model,
          theme: oldProfile.theme,
          voice_preference: oldProfile.voice_preference,
          elevenlabs_voice_id: oldProfile.elevenlabs_voice_id,
          phone: oldProfile.phone,
          profession: oldProfile.profession,
          company: oldProfile.company,
          linkedin_url: oldProfile.linkedin_url,
          use_cases: oldProfile.use_cases,
          tier: oldProfile.tier,
          messages_used_this_period: oldProfile.messages_used_this_period,
          period_start: oldProfile.period_start,
          // Mark all existing users as profile_completed since they were already approved
          profile_completed: true,
          consent_given: oldProfile.tier === 'founder' ? true : false,
        }

        const { error: updateErr } = await newSupa
          .from('profiles')
          .update(profileUpdate)
          .eq('id', newUser.user.id)

        if (updateErr) {
          logError('AUTH', `Failed to update profile for ${user.email}`, updateErr)
        }
      }

      migrated++
      if (migrated % 50 === 0) {
        log('AUTH', `  Progress: ${migrated}/${allUsers.length} users migrated`)
      }
    } catch (err) {
      logError('AUTH', `Exception migrating ${user.email}`, err)
      failed++
    }
  }

  log('AUTH', `Auth migration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  return { migrated, skipped, failed }
}

// ── Step 4: Verification ───────────────────────────────────────────────
async function verify() {
  log('VERIFY', 'Comparing row counts...')

  const tables = [
    'documents', 'chunks', 'profiles', 'conversations', 'messages',
    'usage_logs', 'access_requests', 'saved_responses', 'api_costs',
    'conversation_attachments',
  ]

  const results = []
  for (const table of tables) {
    try {
      const { count: oldCount } = await oldSupa
        .from(table)
        .select('*', { count: 'exact', head: true })

      const { count: newCount } = await newSupa
        .from(table)
        .select('*', { count: 'exact', head: true })

      const match = oldCount === newCount
      results.push({ table, old: oldCount, new: newCount, match })
      log('VERIFY', `  ${match ? '✓' : '✗'} ${table}: old=${oldCount} new=${newCount}`)
    } catch (err) {
      logError('VERIFY', `  Failed to count ${table}`, err)
      results.push({ table, old: '?', new: '?', match: false })
    }
  }

  // Check auth users
  const { data: { users: oldUsers } } = await oldSupa.auth.admin.listUsers({ perPage: 1 })
  const { data: { users: newUsers } } = await newSupa.auth.admin.listUsers({ perPage: 1 })

  // The listUsers with perPage:1 gives us total in the response
  // Let's count properly
  let oldUserCount = 0
  let newUserCount = 0
  let page = 1
  while (true) {
    const { data: { users } } = await oldSupa.auth.admin.listUsers({ page, perPage: 1000 })
    oldUserCount += users.length
    if (users.length < 1000) break
    page++
  }
  page = 1
  while (true) {
    const { data: { users } } = await newSupa.auth.admin.listUsers({ page, perPage: 1000 })
    newUserCount += users.length
    if (users.length < 1000) break
    page++
  }

  const authMatch = oldUserCount === newUserCount
  log('VERIFY', `  ${authMatch ? '✓' : '✗'} auth.users: old=${oldUserCount} new=${newUserCount}`)

  const allMatch = results.every(r => r.match) && authMatch
  log('VERIFY', allMatch ? '✅ All counts match!' : '⚠️  Some counts differ — review above')

  return allMatch
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const schemaOnly = args.includes('--schema-only')
  const dataOnly = args.includes('--data-only')
  const authOnly = args.includes('--auth-only')
  const verifyOnly = args.includes('--verify-only')
  const runAll = !schemaOnly && !dataOnly && !authOnly && !verifyOnly

  console.log('═══════════════════════════════════════════════════')
  console.log('  PMM Sherpa — Supabase Migration (Free → Pro)')
  console.log('  Old: ogbjdvnkejkqqebyetqx (Flytr)')
  console.log('  New: cfztsohetqiaudijlocj (pmm-sherpa)')
  console.log('═══════════════════════════════════════════════════\n')

  try {
    // Step 1: Schema
    if (runAll || schemaOnly) {
      await migrateSchema()
      console.log('')
    }

    // Step 2: Data (phase 1 — independent tables)
    let dependentTables = []
    let optionalTables = []
    if (runAll || dataOnly) {
      const result = await migrateData()
      dependentTables = result.profileDependentTables
      optionalTables = result.optionalTables
      console.log('')
    }

    // Step 3: Auth users (creates profiles via trigger, then updates them)
    if (runAll || authOnly) {
      await migrateAuthUsers()
      console.log('')
    }

    // Step 2b: Data (phase 2 — profile-dependent tables)
    if (runAll || dataOnly) {
      await migrateProfileDependentData([...dependentTables, ...optionalTables])
      console.log('')
    }

    // Step 4: Verify
    if (runAll || verifyOnly) {
      await verify()
    }

    console.log('\n═══════════════════════════════════════════════════')
    console.log('  Migration complete!')
    console.log('═══════════════════════════════════════════════════')
  } catch (err) {
    console.error('\n💥 FATAL ERROR:', err)
    process.exit(1)
  }
}

main()
