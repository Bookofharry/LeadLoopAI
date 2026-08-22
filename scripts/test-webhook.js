import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => envFile.match(new RegExp(`${key}=(.*)`))?.[1]

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRole = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceRole)

async function testWebhook() {
  console.log("=== 1. Generating Test Key ===")
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
  
  await supabase.from("integrations").insert({
    name: "Test Webhook Integration",
    type: "WEBSITE_FORM",
    api_key_hash: tokenHash,
    status: "Active",
    created_by: profile.id
  })

  console.log(`Key generated: ${rawToken}`)

  console.log("\n=== 2. Testing Invalid Credentials ===")
  const invalidRes = await fetch('http://localhost:3000/api/webhooks/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer bad_token' },
    body: JSON.stringify({ rawContent: "test" })
  })
  console.log(`Status: ${invalidRes.status}`)

  console.log("\n=== 3. Testing Website Webhook ===")
  const validRes = await fetch('http://localhost:3000/api/webhooks/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rawToken}` },
    body: JSON.stringify({
      source: "WEBSITE_FORM",
      externalId: "buildfest-form-test-001",
      rawContent: "We need solar installation for our new 25-room hotel in Abuja. Budget is approximately ₦12 million and we're hoping to begin next month.",
      structuredData: {
        fullName: "Chinedu Obi",
        email: "chinedu.webhook@test.com",
        company: "GreenView Hotels"
      },
      metadata: { formName: "Request a Quote" }
    })
  })
  const validData = await validRes.json()
  console.log(`Status: ${validRes.status}`)
  console.log("Response:", validData)

  console.log("\n=== 4. Testing Idempotency ===")
  const idempotentRes = await fetch('http://localhost:3000/api/webhooks/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rawToken}` },
    body: JSON.stringify({
      source: "WEBSITE_FORM",
      externalId: "buildfest-form-test-001",
      rawContent: "We need solar installation for our new 25-room hotel in Abuja. Budget is approximately ₦12 million and we're hoping to begin next month.",
    })
  })
  const idempotentData = await idempotentRes.json()
  console.log(`Status: ${idempotentRes.status}`)
  console.log("Response:", idempotentData)
}

testWebhook()
