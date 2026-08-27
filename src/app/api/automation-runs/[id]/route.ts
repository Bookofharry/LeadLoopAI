import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data: run, error } = await supabase.from('automation_runs').select('*').eq('id', id).single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If run completed successfully and has lead_id, fetch lead summary
    let lead = null;
    if (run && run.lead_id) {
      const { data: leadData } = await supabase.from('leads').select('id, name, priority, lead_score').eq('id', run.lead_id).single();
      lead = leadData;
    }

    return NextResponse.json({ success: true, run: { ...run, lead }, }, { status: 200 });
  } catch (err: any) {
    console.error('automation-run GET failed', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
