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
    // 1. Wipe selected public tables with multiple passes to handle FK constraints
    console.log("Wiping selected public tables (multi-pass to handle FK constraints)...");

    let tablesToWipe = [
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

    const maxPasses = 6;
    for (let pass = 1; pass <= maxPasses && tablesToWipe.length > 0; pass++) {
      console.log(`Pass ${pass}/${maxPasses}, tables remaining: ${tablesToWipe.length}`);
      const remaining = [];

      for (const table of tablesToWipe) {
        try {
          console.log(`Attempting to clear table: ${table}`);
          const { error, count } = await admin.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
          if (error) {
            console.warn(`Pass ${pass}: Could not clear ${table}: ${error.message}`);
            remaining.push(table);
          } else {
            console.log(`Pass ${pass}: Cleared ${table}`);
          }
        } catch (err) {
          console.warn(`Pass ${pass}: Unexpected error clearing ${table}:`, String(err));
          remaining.push(table);
        }
      }

      if (remaining.length === tablesToWipe.length) {
        console.log(`No progress on pass ${pass}; will retry up to ${maxPasses} passes.`);
      }

      tablesToWipe = remaining;

      // small delay between passes to allow DB state to settle
      if (tablesToWipe.length > 0) {
        await new Promise((res) => setTimeout(res, 700));
      }
    }

    if (tablesToWipe.length > 0) {
      console.warn("Finished passes but some tables could not be cleared due to constraints:", tablesToWipe);
      console.warn("Consider running a TRUNCATE ... CASCADE via a direct DB connection if you want a forceful wipe.");
    }

    // 2. Auth users deletion is disabled by default to avoid removing real users.
    //    To enable deletion of auth users set REMOVE_AUTH=true in your environment.
    if (process.env.REMOVE_AUTH === 'true') {
      console.log("REMOVE_AUTH=true; deleting auth users...");
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
    } else {
      console.log("Skipping deletion of auth users (REMOVE_AUTH is not 'true').");
    }

    console.log("Database wipe complete.");
  } catch (err) {
    console.error("Fatal error wiping database:", err);
    process.exit(1);
  }
}

wipeDatabase();
