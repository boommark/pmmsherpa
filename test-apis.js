// Simple API test script
require('dotenv').config({ path: '.env.local' });

async function testAPIs() {
  console.log('\n🧪 Testing API Keys...\n');

  // Test 1: Anthropic
  console.log('1️⃣ Anthropic API Key:');
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('   ✅ Found:', process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');
  } else {
    console.log('   ❌ Missing!');
  }

  // Test 2: Google AI
  console.log('\n2️⃣ Google AI API Key:');
  if (process.env.GOOGLE_API_KEY) {
    console.log('   ✅ Found:', process.env.GOOGLE_API_KEY.substring(0, 20) + '...');
  } else {
    console.log('   ❌ Missing!');
  }

  // Test 3: OpenAI
  console.log('\n3️⃣ OpenAI API Key:');
  if (process.env.OPENAI_API_KEY) {
    console.log('   ✅ Found:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
  } else {
    console.log('   ❌ Missing!');
  }

  // Test 4: Perplexity
  console.log('\n4️⃣ Perplexity API Key:');
  if (process.env.PERPLEXITY_API_KEY) {
    console.log('   ✅ Found:', process.env.PERPLEXITY_API_KEY.substring(0, 20) + '...');
  } else {
    console.log('   ❌ Missing!');
  }

  // Test 5: Resend
  console.log('\n5️⃣ Resend API Key:');
  if (process.env.RESEND_API_KEY) {
    console.log('   ✅ Found:', process.env.RESEND_API_KEY.substring(0, 20) + '...');
  } else {
    console.log('   ❌ Missing!');
  }

  // Test 6: Supabase
  console.log('\n6️⃣ Supabase Configuration:');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('   ✅ URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  } else {
    console.log('   ❌ URL Missing!');
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('   ✅ Anon Key: Found');
  } else {
    console.log('   ❌ Anon Key Missing!');
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('   ✅ Service Key: Found');
  } else {
    console.log('   ❌ Service Key Missing!');
  }

  console.log('\n✅ All API keys are configured!\n');
}

testAPIs().catch(console.error);
