import { createAdminClient } from "@/lib/supabase/server";
import { processCustomerEnquiry } from "@/lib/services/ai";
import { after } from "next/server";

export type IntakeSource = "MANUAL" | "WEBSITE_FORM" | "WEBHOOK" | "GMAIL" | "WHATSAPP";

export interface IncomingLeadPayload {
  companyId: string;
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

function normalizeManualContent(content: string) {
  return content.trim().replace(/\s+/g, " ");
}

export async function processIncomingLead(payload: IncomingLeadPayload) {
  const supabase = createAdminClient();
  let automationRunId: string | null = null;
  let interactionId: string | null = null;

  try {
    // Manual submissions have no provider message ID, so compare normalized content
    // before creating another interaction, automation run, task, or notification.
    if (payload.source === "MANUAL") {
      const normalizedContent = normalizeManualContent(payload.rawContent);
      const { data: exactInteractions, error: exactCheckError } = await supabase
        .from("interactions")
        .select("id, lead_id, raw_content")
        .eq("company_id", payload.companyId)
        .eq("source", "MANUAL")
        .eq("raw_content", payload.rawContent.trim())
        .order("created_at", { ascending: false })
        .limit(1);

      if (exactCheckError) {
        throw new Error(`Duplicate Check Error: ${exactCheckError.message}`);
      }

      let duplicate: { id: string; lead_id: string | null; raw_content: string } | undefined = exactInteractions?.[0];

      // Also catch harmless whitespace differences in recently submitted content.
      if (!duplicate) {
        const { data: recentInteractions, error: duplicateCheckError } = await supabase
          .from("interactions")
          .select("id, lead_id, raw_content")
          .eq("company_id", payload.companyId)
          .eq("source", "MANUAL")
          .order("created_at", { ascending: false })
          .limit(200);

        if (duplicateCheckError) {
          throw new Error(`Duplicate Check Error: ${duplicateCheckError.message}`);
        }

        duplicate = recentInteractions?.find(
          (interaction) => normalizeManualContent(interaction.raw_content) === normalizedContent
        );
      }

      if (duplicate) {
        let lead = null;
        if (duplicate.lead_id) {
          const { data: existingLead } = await supabase
            .from("leads")
            .select("id, name, company, email")
            .eq("id", duplicate.lead_id)
            .single();
          lead = existingLead;
        }

        return {
          status: "EXACT_DUPLICATE",
          interactionId: duplicate.id,
          leadId: duplicate.lead_id,
          lead,
        };
      }
    }

    // 0. Idempotency Check
    if (payload.externalId) {
      const { data: existingInteraction } = await supabase
        .from("interactions")
        .select("id, lead_id")
        .eq("company_id", payload.companyId)
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
        company_id: payload.companyId,
        source: payload.source, 
        raw_content: payload.rawContent.trim(),
        external_id: payload.externalId || null
      })
      .select("id")
      .single();

    if (intError) throw new Error(`Interaction Error: ${intError.message}`);
    interactionId = interaction.id;

    // 2. Create automation run (return to caller immediately after enqueue)
    const { data: run, error: runError } = await supabase
      .from("automation_runs")
      .insert({
        company_id: payload.companyId,
        interaction_id: interactionId,
        trigger_type: "intake",
        source: payload.source,
        status: "Running",
        current_step: "Queued",
      })
      .select("id")
      .single();

    if (runError) throw new Error(`Run Error: ${runError.message}`);
    automationRunId = run.id;

    // Keep background processing alive after the server action returns.
    // A detached promise can be terminated by the Next.js runtime mid-extraction.
    after(async () => {
      const bgSupabase = createAdminClient();
      const logStep = async (stepName: string, status: string, output: unknown = null, error: unknown = null) => {
        await bgSupabase.from("automation_steps").insert({
          company_id: payload.companyId,
          automation_run_id: automationRunId,
          step_name: stepName,
          status,
          output,
          error: error ? String(error) : null,
        });
        await bgSupabase.from("automation_runs")
          .update({ current_step: stepName })
          .eq("id", automationRunId);
      };

      try {
        await bgSupabase.from("automation_runs").update({ current_step: "AI Extraction" }).eq("id", automationRunId);

        // AI Extraction
        let aiResult;
        try {
          aiResult = await processCustomerEnquiry(payload.rawContent);
          if (payload.structuredData) {
             if (payload.structuredData.fullName) aiResult.name = payload.structuredData.fullName;
             if (payload.structuredData.email) aiResult.email = payload.structuredData.email;
             if (payload.structuredData.phone) aiResult.phone = payload.structuredData.phone;
             if (payload.structuredData.company) aiResult.company = payload.structuredData.company;
          }
          await logStep("AI Extraction", "Success", aiResult);
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          await logStep("AI Extraction", "Failed", null, msg);
          throw error;
        }

        // Update Interaction Summary
        await bgSupabase.from("interactions")
          .update({ summary: aiResult.summary })
          .eq("id", interactionId);

        // Confidence Check
        if (aiResult.confidence < 0.70) {
          await logStep("Confidence Check", "Needs Review", { confidence: aiResult.confidence, missing: aiResult.missing_fields });
          const { data: reviewRecord } = await bgSupabase.from("review_queue").insert({
            company_id: payload.companyId,
            interaction_id: interactionId,
            extracted_data: aiResult,
            confidence: aiResult.confidence,
            missing_fields: aiResult.missing_fields,
            status: "Pending"
          }).select("id").single();

          await bgSupabase.from("automation_runs")
            .update({ status: "Needs Review", current_step: "Human Review Required" })
            .eq("id", automationRunId);

          return;
        }

        await logStep("Confidence Check", "Passed", { confidence: aiResult.confidence });

        // Continue processing (CRM, tasks, notifications)
        await continueLeadProcessing(
          payload.companyId,
          payload.source,
          aiResult as any,
          interactionId!,
          automationRunId!,
          false
        );

      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[bg processIncomingLead] Failed:", msg);
        await bgSupabase.from("automation_runs").update({ 
          status: "Failed",
          error_message: msg,
          completed_at: new Date().toISOString()
        }).eq("id", automationRunId);
      }
    });

    // Return immediately; client can poll automation run for completion
    return {
      status: "RUNNING",
      automationRunId,
      interactionId
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[processIncomingLead] enqueue failed:", msg);
    if (automationRunId) {
      await supabase.from("automation_runs").update({ 
        status: "Failed",
        error_message: msg,
        completed_at: new Date().toISOString()
      }).eq("id", automationRunId);
    }
    throw error;
  }
}

export async function continueLeadProcessing(
  companyId: string,
  source: IntakeSource,
  aiResult: Record<string, unknown>,
  interactionId: string,
  automationRunId: string,
  isHumanApproved: boolean = false
) {
  const supabase = createAdminClient();
  
  const logStep = async (stepName: string, status: string, output: unknown = null, error: unknown = null) => {
    await supabase.from("automation_steps").insert({
      company_id: companyId,
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

  if (isHumanApproved) {
    await logStep("Human Review Approved", "Success", { correctedData: aiResult });
  }

  try {
    // 6. Duplicate Detection (Simplified: exact email match within same company)
    let leadId = null;
    let existingLead = null;
    
    if (aiResult.email) {
       const { data: leads } = await supabase
         .from("leads")
         .select("id")
         .eq("company_id", companyId)
         .eq("email", aiResult.email)
         .limit(1);
         
       if (leads && leads.length > 0) {
         existingLead = leads[0];
       }
    }

    // 7. Deterministic Assignment Logic
    // Find a SALES_REP in the company first
    let { data: reps } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("role", "SALES_REP")
      .limit(1);

    // If no sales rep, fallback to an ADMIN
    if (!reps || reps.length === 0) {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("role", "ADMIN")
        .limit(1);
      reps = admins;
    }

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
        company_id: companyId,
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
        source: source,
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
      const { data: matchingTasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("company_id", companyId)
        .eq("lead_id", leadId)
        .eq("status", "Pending")
        .eq("title", aiResult.recommended_action)
        .limit(1);

      if (matchingTasks && matchingTasks.length > 0) {
        await logStep("Task Creation", "Skipped", { reason: "Equivalent pending task already exists", task_id: matchingTasks[0].id });
      } else {
        await supabase.from("tasks").insert({
          company_id: companyId,
          lead_id: leadId,
          assigned_to: assignedRepId,
          title: aiResult.recommended_action,
          priority: aiResult.priority,
          created_by: "automation"
        });
        await logStep("Task Creation", "Success", { title: aiResult.recommended_action });
      }
    }

    // 9. Notification Generation
    if (assignedRepId) {
       const isDuplicate = existingLead ? "Existing" : "New";
       await supabase.from("notifications").insert({
         company_id: companyId,
         user_id: assignedRepId,
         lead_id: leadId,
         title: `${isDuplicate} ${aiResult.priority} Lead${isHumanApproved ? ' (Human Approved)' : ''}`,
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
      isDuplicate: !!existingLead,
      aiResult
    };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("continueLeadProcessing error:", error);
    await supabase.from("automation_runs").update({ 
      status: "Failed",
      error_message: msg,
      completed_at: new Date().toISOString()
    }).eq("id", automationRunId);
    throw error;
  }
}

