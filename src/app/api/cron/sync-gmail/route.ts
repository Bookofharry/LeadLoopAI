import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { syncGmailInbox } from '@/lib/services/gmailAdapter';

// Maximum duration for the sync execution. 
// Vercel Pro allows up to 300s, Hobby 10s.
export const maxDuration = 300; 

export async function GET(request: Request) {
  // 1. Authenticate the cron request to prevent abuse
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createAdminClient();

    // Fetch all active Gmail integrations
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('company_id, created_at')
      .eq('type', 'GMAIL')
      .eq('status', 'Active');

    if (error) {
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ status: 'No active Gmail integrations found.' });
    }

    const results = [];

    // Run sync for each company sequentially to avoid overwhelming resources.
    // In a massive multi-tenant scale, we might batch these or push to a worker queue.
    for (const integration of integrations) {
      const result = await syncGmailInbox(integration.company_id, integration.created_at);
      results.push({ companyId: integration.company_id, ...result });
    }

    return NextResponse.json({ 
      status: 'Sync completed', 
      results 
    });
  } catch (error: any) {
    console.error('[Cron] Error during Gmail sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
