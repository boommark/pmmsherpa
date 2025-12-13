import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('Service Role Key:', supabaseKey ? 'Set' : 'NOT SET')

async function testDb() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(10)

  console.log('\n=== CONVERSATIONS ===')
  if (convError) {
    console.error('Error fetching conversations:', convError)
  } else {
    console.log('Found', conversations?.length, 'conversations')
    conversations?.forEach(c => {
      console.log(`- ${c.id}: "${c.title}" (${c.message_count} msgs)`)
    })
  }

  // Check for specific conversation
  const targetConvId = '100831e3-16a8-4df8-9f7e-5b17193ac9fb'
  const { data: targetConv, error: targetError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', targetConvId)
    .single()

  console.log('\n=== TARGET CONVERSATION ===')
  if (targetError) {
    console.error('Error fetching target conversation:', targetError)
  } else {
    console.log('Conversation:', targetConv)
  }

  // Get messages for target conversation
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', targetConvId)
    .order('created_at', { ascending: true })

  console.log('\n=== MESSAGES IN TARGET CONVERSATION ===')
  if (msgError) {
    console.error('Error fetching messages:', msgError)
  } else {
    console.log('Found', messages?.length, 'messages')
    messages?.forEach(m => {
      const preview = m.content ? m.content.substring(0, 80) : '[no content]'
      console.log(`- [${m.role}] ${preview}...`)
    })
  }

  // Get ALL messages to check if they exist
  const { data: allMessages, error: allMsgError, count } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .limit(5)

  console.log('\n=== ALL MESSAGES COUNT ===')
  if (allMsgError) {
    console.error('Error:', allMsgError)
  } else {
    console.log('Total messages in database:', count)
    console.log('Sample messages:', allMessages?.length)
    if (allMessages && allMessages.length > 0) {
      console.log('\nSample message data:')
      allMessages.forEach(m => {
        console.log(`  Conv: ${m.conversation_id}, Role: ${m.role}`)
      })
    }
  }
}

testDb().catch(console.error)
