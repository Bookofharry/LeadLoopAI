import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processIncomingLead } from "@/lib/services/processIncomingLead";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const supabase = createAdminClient();
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status, company_id")
      .eq("api_key_hash", tokenHash)
      .eq("status", "Active")
      .single();

    if (!integration || !integration.company_id) {
      return NextResponse.json({ error: "Unauthorized: Invalid integration key or missing tenant context" }, { status: 403 });
    }

    // 2. Parse Payload
    const body = await req.json();
    const source = body.source || "WEBSITE_FORM";
    const rawContent = body.rawContent || body.raw_content; // support both
    
    if (!rawContent) {
      return NextResponse.json({ error: "Missing rawContent" }, { status: 400 });
    }

    // Update last_used_at
    await supabase.from("integrations").update({ last_used_at: new Date().toISOString() }).eq("id", integration.id);

    // 3. Process via Core Engine
    const result = await processIncomingLead({
      companyId: integration.company_id,
      source,
      rawContent,
      structuredData: body.structuredData,
      metadata: body.metadata,
      externalId: body.externalId
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Webhook route error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
