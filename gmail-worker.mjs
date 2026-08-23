import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fetch from 'node-fetch'; // Built-in fetch in Node 18+ can also be used

const POLLING_INTERVAL_MS = 60 * 1000; // 1 minute

console.log("=========================================");
console.log("🚀 LeadLoop Gmail Background Worker");
console.log(`⏱️  Polling interval: ${POLLING_INTERVAL_MS / 1000} seconds`);
console.log("=========================================\n");

async function pollGmail() {
  try {
    const cronSecret = process.env.CRON_SECRET || "";
    
    console.log(`[${new Date().toISOString()}] Triggering Gmail Sync...`);
    
    // We hit the Next.js API route that securely handles the heavy lifting
    const res = await fetch('http://localhost:3000/api/cron/sync-gmail', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    if (!res.ok) {
      console.error(`[${new Date().toISOString()}] ❌ Sync failed with status: ${res.status}`);
      const text = await res.text();
      console.error(`Response: ${text}`);
      return;
    }

    const data = await res.json();
    console.log(`[${new Date().toISOString()}] ✅ Sync completed:`, data);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Network/System Error triggering sync:`, err.message);
  }
}

// Run once immediately
pollGmail();

// Then run on interval
setInterval(pollGmail, POLLING_INTERVAL_MS);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\nShutting down Gmail worker...");
  process.exit(0);
});
