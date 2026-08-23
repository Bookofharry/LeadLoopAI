import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      *,
      assigned_to:profiles!leads_assigned_to_company_fk(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return new NextResponse("No leads found", { status: 404 });
  }

  // Define CSV headers
  const headers = [
    "ID",
    "Created At",
    "Name",
    "Company",
    "Email",
    "Phone",
    "Location",
    "Service",
    "Budget Min",
    "Budget Max",
    "Timeline",
    "Intent",
    "Lead Score",
    "Priority",
    "Status",
    "Source",
    "Assigned To"
  ];

  // Helper to escape CSV values
  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""'); // escape double quotes
    return `"${str}"`; // wrap in quotes
  };

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.created_at,
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.location,
    lead.service,
    lead.budget_min,
    lead.budget_max,
    lead.timeline,
    lead.intent,
    lead.lead_score,
    lead.priority,
    lead.status,
    lead.source,
    // @ts-ignore
    lead.assigned_to?.name || ""
  ].map(escapeCsv).join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leadloop_leads_export.csv"',
    },
  });
}
