import { createAdminClient } from "@/lib/supabase/server";
import { processCustomerEnquiry } from "@/lib/services/ai";

export type IntakeSource = "MANUAL" | "WEBSITE_FORM" | "WEBHOOK" | "GMAIL" | "WHATSAPP";

export interface IncomingLeadPayload {
  source: IntakeSource;
  rawContent: string;
  structuredData?: {
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    message?: string;
  };
  metadata?: Record<string, unknown>;
  externalId?: string;
  receivedAt?: string;
}

export async function processIncomingLead(payload: IncomingLeadPayload) {
  const supabase = createAdminClient();
  let automationRunId: string | null = null;
  let interactionId: string | null = null;

  try {
    // 0. Idempotency Check
    if (payload.externalId) {
      const { data: existingInteraction } = await supabase
        .from("interactions")
        .select("id, lead_id")
        .eq("source", payload.source)
        .eq("external_id", payload.externalId)
        .limit(1);

      if (existingInteraction && existingInteraction.length > 0) {
        console.log(`[Idempotency] Skipped duplicate processing for externalId: ${payload.externalId}`);
        return {
          status: "IDEMPOTENT_SKIPPED",
          interactionId: existingInteraction[0].id,
          leadId: existingInteraction[0].lead_id
        };
      }
    }

    // 1. Create interaction
    const { data: interaction, error: intError } = await supabase
      .from("interactions")
      .insert({ 
        source: payload.source, 
        raw_content: payload.rawContent,
        external_id: payload.externalId || null
      })
      .select("id")
      .single();

    if (intError) throw new Error(`Interaction Error: ${intError.message}`);
    interactionId = interaction.id;

    // 2. Create automation run
    const { data: run, error: runError } = await supabase
      .from("automation_runs")
      .insert({
        interaction_id: interactionId,
        trigger_type: "intake",
        source: payload.source,
        status: "Running",
        current_step: "AI Extraction",
      })
      .select("id")
      .single();

    if (runError) throw new Error(`Run Error: ${runError.message}`);
    automationRunId = run.id;

    // Helper to log steps
    const logStep = async (stepName: string, status: string, output: any = null, error: any = null) => {
      await supabase.from("automation_steps").insert({
        automation_run_id: automationRunId,
        step_name: stepName,
        status,
        output,
        error: error ? String(error) : null,
      });
      await supabase.from("automation_runs")
        .update({ current_step: stepName })
        .eq("id", automationRunId);
    };

    // 3. AI Extraction
    let aiResult;
    try {
      aiResult = await processCustomerEnquiry(payload.rawContent);
      
      // Override with trusted structured data if available
      if (payload.structuredData) {
         if (payload.structuredData.fullName) aiResult.name = payload.structuredData.fullName;
         if (payload.structuredData.email) aiResult.email = payload.structuredData.email;
         if (payload.structuredData.phone) aiResult.phone = payload.structuredData.phone;
         if (payload.structuredData.company) aiResult.company = payload.structuredData.company;
      }

      await logStep("AI Extraction", "Success", aiResult);
    } catch (e: any) {
      await logStep("AI Extraction", "Failed", null, e.message);
      throw e;
    }

    // 4. Update Interaction Summary
    await supabase.from("interactions")
      .update({ summary: aiResult.summary })
      .eq("id", interactionId);

    // 5. Confidence Check (Human Review Queue)
    if (aiResult.confidence < 0.70) {
      await logStep("Confidence Check", "Needs Review", { confidence: aiResult.confidence, missing: aiResult.missing_fields });
      
      const { data: reviewRecord } = await supabase.from("review_queue").insert({
        interaction_id: interactionId,
        extracted_data: aiResult,
        confidence: aiResult.confidence,
        missing_fields: aiResult.missing_fields,
        status: "Pending"
      }).select("id").single();

      await supabase.from("automation_runs")
        .update({ status: "Needs Review", current_step: "Human Review Required" })
        .eq("id", automationRunId);
        
      return { 
        status: "NEEDS_REVIEW",
        reviewId: reviewRecord?.id,
        automationRunId: automationRunId,
        aiResult
      };
    }
    
    await logStep("Confidence Check", "Passed", { confidence: aiResult.confidence });

    // 6. Duplicate Detection (Simplified: exact email match)
    let leadId = null;
    let existingLead = null;
    
    if (aiResult.email) {
       const { data: leads } = await supabase
         .from("leads")
         .select("id")
         .eq("email", aiResult.email)
         .limit(1);
         
       if (leads && leads.length > 0) {
         existingLead = leads[0];
       }
    }

    // 7. Deterministic Assignment Logic
    const { data: reps } = await supabase.from("profiles").select("id, name").limit(1);
    const assignedRepId = (reps && reps.length > 0) ? reps[0].id : null;
    const assignedRepName = (reps && reps.length > 0) ? reps[0].name : "Unassigned";

    if (existingLead) {
      leadId = existingLead.id;
      await supabase.from("leads").update({
        lead_score: aiResult.lead_score,
        priority: aiResult.priority,
        ai_summary: aiResult.summary,
        ai_confidence: aiResult.confidence,
        updated_at: new Date().toISOString()
      }).eq("id", leadId);
      
      await logStep("CRM Update", "Success", { action: "Updated", lead_id: leadId });
    } else {
      const { data: newLead, error: leadError } = await supabase.from("leads").insert({
        name: aiResult.name || "Unknown",
        company: aiResult.company,
        email: aiResult.email,
        phone: aiResult.phone,
        location: aiResult.location,
        service: aiResult.service,
        budget_min: aiResult.budget_min,
        budget_max: aiResult.budget_max,
        timeline: aiResult.timeline,
        intent: aiResult.intent,
        lead_score: aiResult.lead_score,
        priority: aiResult.priority,
        status: "New",
        source: payload.source,
        assigned_to: assignedRepId,
        ai_summary: aiResult.summary,
        ai_confidence: aiResult.confidence,
      }).select("id").single();
      
      if (leadError) throw new Error(`Lead Create Error: ${leadError.message}`);
      leadId = newLead.id;
      await logStep("CRM Update", "Success", { action: "Created", lead_id: leadId });
    }

    // Tie run and interaction to lead
    await supabase.from("automation_runs").update({ lead_id: leadId }).eq("id", automationRunId);
    await supabase.from("interactions").update({ lead_id: leadId }).eq("id", interactionId);

    // 8. Follow-up Task Creation
    if (aiResult.recommended_action) {
      await supabase.from("tasks").insert({
        lead_id: leadId,
        assigned_to: assignedRepId,
        title: aiResult.recommended_action,
        priority: aiResult.priority,
        created_by: "automation"
      });
      await logStep("Task Creation", "Success", { title: aiResult.recommended_action });
    }

    // 9. Notification Generation
    if (assignedRepId) {
       await supabase.from("notifications").insert({
         user_id: assignedRepId,
         lead_id: leadId,
         title: `New ${aiResult.priority} Lead`,
         message: `${aiResult.name} from ${aiResult.company || 'a company'} was assigned to you.`
       });
       await logStep("Notification", "Success", { assigned_to: assignedRepId });
    }

    // 10. Complete Run
    await supabase.from("automation_runs").update({ 
      status: "Success",
      current_step: "Completed",
      completed_at: new Date().toISOString()
    }).eq("id", automationRunId);

    return { 
      status: "SUCCESS",
      leadId: leadId,
      automationRunId: automationRunId,
      priority: aiResult.priority,
      assignedRep: assignedRepName,
      aiResult
    };

  } catch (error: any) {
    console.error("processIncomingLead error:", error);
    if (automationRunId) {
      const supabase = createAdminClient();
      await supabase.from("automation_runs").update({ 
        status: "Failed",
        error_message: error.message,
        completed_at: new Date().toISOString()
      }).eq("id", automationRunId);
    }
    throw error;
  }
}
