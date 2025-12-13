#!/usr/bin/env python3
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env.local
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f"Supabase URL: {'Set' if supabase_url else 'NOT SET'}")
print(f"Service Role Key: {'Set' if supabase_key else 'NOT SET'}")

if not supabase_url or not supabase_key:
    print("Error: Missing environment variables")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

# Get conversations
print("\n=== CONVERSATIONS ===")
result = supabase.table('conversations').select('*').order('updated_at', desc=True).limit(10).execute()
conversations = result.data
print(f"Found {len(conversations)} conversations")
for c in conversations:
    print(f"- {c['id']}: \"{c['title']}\" ({c.get('message_count', 0)} msgs)")

# Check for specific conversation
target_conv_id = '100831e3-16a8-4df8-9f7e-5b17193ac9fb'
print(f"\n=== TARGET CONVERSATION ({target_conv_id}) ===")
result = supabase.table('conversations').select('*').eq('id', target_conv_id).execute()
if result.data:
    print(f"Found: {result.data[0]}")
else:
    print("NOT FOUND")

# Get messages for target conversation
print("\n=== MESSAGES IN TARGET CONVERSATION ===")
result = supabase.table('messages').select('id, role, content, created_at').eq('conversation_id', target_conv_id).order('created_at').execute()
messages = result.data
print(f"Found {len(messages)} messages")
for m in messages:
    preview = (m['content'] or '[no content]')[:80]
    print(f"- [{m['role']}] {preview}...")

# Get ALL messages count
print("\n=== ALL MESSAGES COUNT ===")
result = supabase.table('messages').select('*', count='exact').limit(5).execute()
print(f"Total messages in database: {result.count}")
print(f"Sample messages: {len(result.data)}")
if result.data:
    print("\nSample message data:")
    for m in result.data:
        print(f"  Conv: {m['conversation_id']}, Role: {m['role']}")
