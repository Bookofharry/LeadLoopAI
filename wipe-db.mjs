import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function wipeDatabase() {
  console.log("Starting full database wipe...");

  try {
    // 1. Wipe all data in public schema
    console.log("Wiping all public tables...");
    
    const tablesToWipe = [
      "notifications",
      "tasks",
      "automation_steps",
      "automation_runs",
      "review_queue",
      "interactions",
      "leads",
      "integrations",
      "profiles",
      "companies"
    ];

    for (const table of tablesToWipe) {
      console.log(`Clearing table: ${table}`);
      const { error } = await admin.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000"); 
      if (error) {
        console.warn(`Error clearing ${table}:`, error.message);
      }
    }

    // 2. Wipe all auth users
    console.log("Fetching all auth users...");
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;

    console.log(`Found ${users.length} users to delete.`);
    let deletedCount = 0;
    for (const user of users) {
      const { error: delError } = await admin.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(`Failed to delete user ${user.id}:`, delError.message);
      } else {
        deletedCount++;
      }
    }
    console.log(`Successfully deleted ${deletedCount} users.`);

    console.log("Database wipe complete.");
  } catch (err) {
    console.error("Fatal error wiping database:", err);
    process.exit(1);
  }
}

wipeDatabase();
