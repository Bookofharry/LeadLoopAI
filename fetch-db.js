import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => envFile.match(new RegExp(`${key}=(.*)`))?.[1]

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRole = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceRole)

async function check() {
  console.log("=== LEADS ===");
  const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(2)
  console.log(JSON.stringify(leads, null, 2))

  console.log("=== INTERACTIONS ===");
  const { data: interactions } = await supabase.from('interactions').select('*').order('created_at', { ascending: false }).limit(3)
  console.log(JSON.stringify(interactions, null, 2))

  console.log("=== TASKS ===");
  const { data: tasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(2)
  console.log(JSON.stringify(tasks, null, 2))

  console.log("=== AUTOMATION RUNS ===");
  const { data: runs } = await supabase.from('automation_runs').select('*').order('started_at', { ascending: false }).limit(3)
  console.log(JSON.stringify(runs, null, 2))

  console.log("=== REVIEW QUEUE ===");
  const { data: queue } = await supabase.from('review_queue').select('*').order('created_at', { ascending: false }).limit(2)
  console.log(JSON.stringify(queue, null, 2))
}

check()
