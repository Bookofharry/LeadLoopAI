import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => envFile.match(new RegExp(`${key}=(.*)`))?.[1]

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRole = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !serviceRole) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const reps = [
  { name: 'Sarah Johnson', email: 'sarah@leadloop.ai', role: 'sales_rep' },
  { name: 'Michael Chen', email: 'michael@leadloop.ai', role: 'sales_rep' },
  { name: 'Grace Williams', email: 'grace@leadloop.ai', role: 'sales_rep' }
]

async function seed() {
  console.log("Seeding sales reps...")

  for (const rep of reps) {
    // Check if user exists
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const existingUser = usersData.users.find(u => u.email === rep.email)
    
    let userId;

    if (existingUser) {
      console.log(`User ${rep.email} already exists. ID: ${existingUser.id}`)
      userId = existingUser.id
    } else {
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: rep.email,
        password: 'password123',
        email_confirm: true
      })
      if (error) {
        console.error(`Failed to create ${rep.email}:`, error.message)
        continue;
      }
      userId = data.user.id
      console.log(`Created user ${rep.email}. ID: ${userId}`)
    }

    // Insert into profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: rep.name,
        email: rep.email,
        role: rep.role
      })

    if (profileError) {
      console.error(`Failed to create profile for ${rep.name}:`, profileError.message)
    } else {
      console.log(`Profile created/updated for ${rep.name}`)
    }
  }
  
  console.log("Seeding complete.")
}

seed()
