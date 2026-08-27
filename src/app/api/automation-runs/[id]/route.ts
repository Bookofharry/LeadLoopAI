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

    // Return the saved lead data needed by the intake completion screen.
    let lead = null;
    let assignedRep = null;
    if (run && run.lead_id) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('id, name, company, email, phone, location, service, budget_min, budget_max, timeline, intent, priority, lead_score, ai_summary, ai_confidence, assigned_to')
        .eq('id', run.lead_id)
        .single();
      lead = leadData;

      if (leadData?.assigned_to) {
        const { data: repData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', leadData.assigned_to)
          .single();
        assignedRep = repData?.name || null;
      }
    }

    return NextResponse.json({ success: true, run: { ...run, lead, assignedRep } }, { status: 200 });
  } catch (err: any) {
    console.error('automation-run GET failed', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
