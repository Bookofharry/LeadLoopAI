"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { AIQualificationResult } from "@/lib/services/ai"

export async function getPendingReviews() {
  const supabase = await createClient()

  // Join review_queue with interactions to get raw content
  const { data, error } = await supabase
    .from("review_queue")
    .select(`
      id,
      extracted_data,
      confidence,
      missing_fields,
      status,
      created_at,
      interactions (
        id,
        source,
        raw_content
      )
    `)
    .eq("status", "Pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch pending reviews:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function approveReview(reviewId: string, correctedData: AIQualificationResult, interactionId: string) {
  // Use admin client since we are finalizing a backend workflow
  const supabase = createAdminClient()

  try {
    const { data: userAuth } = await supabase.auth.getUser()
    const userId = userAuth.user?.id

    // 1. Get a sales rep to assign to
    const { data: reps } = await supabase.from("profiles").select("id").limit(1)
    const assignedRepId = (reps && reps.length > 0) ? reps[0].id : null

    // 2. Fetch the interaction to get the source
    const { data: interaction } = await supabase.from("interactions").select("source").eq("id", interactionId).single()
    const source = interaction?.source || "REVIEW_QUEUE"

    // 3. Create the lead
    const { data: newLead, error: leadError } = await supabase.from("leads").insert({
      name: correctedData.name || "Unknown",
      company: correctedData.company,
      email: correctedData.email,
      phone: correctedData.phone,
      location: correctedData.location,
      service: correctedData.service,
      budget_min: correctedData.budget_min,
      budget_max: correctedData.budget_max,
      timeline: correctedData.timeline,
      intent: correctedData.intent,
      lead_score: correctedData.lead_score,
      priority: correctedData.priority,
      status: "New",
      source: source,
      assigned_to: assignedRepId,
      ai_summary: correctedData.summary,
      ai_confidence: correctedData.confidence,
    }).select("id").single();
    
    if (leadError) throw new Error(`Lead Create Error: ${leadError.message}`);
    const leadId = newLead.id;

    // 4. Update the interaction
    await supabase.from("interactions").update({ lead_id: leadId }).eq("id", interactionId)

    // 5. Update automation run
    // Find the automation run for this interaction that was marked as Needs Review
    const { data: run } = await supabase
      .from("automation_runs")
      .select("id")
      .eq("interaction_id", interactionId)
      .eq("status", "Needs Review")
      .single()

    if (run) {
      const runId = run.id;
      
      await supabase.from("automation_steps").insert({
        automation_run_id: runId,
        step_name: "Human Review Approved",
        status: "Success",
        output: { correctedData }
      })

      await supabase.from("automation_runs").update({ 
        lead_id: leadId,
        status: "Success",
        current_step: "Completed",
        completed_at: new Date().toISOString()
      }).eq("id", runId)
    }

    // 6. Update the review_queue status
    await supabase.from("review_queue").update({
      status: "Approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      extracted_data: correctedData // save the final version
    }).eq("id", reviewId)

    // 7. Follow-up Task Creation
    if (correctedData.recommended_action) {
      await supabase.from("tasks").insert({
        lead_id: leadId,
        assigned_to: assignedRepId,
        title: correctedData.recommended_action,
        priority: correctedData.priority,
        created_by: "automation"
      });
    }

    // 8. Notification
    if (assignedRepId) {
       await supabase.from("notifications").insert({
         user_id: assignedRepId,
         lead_id: leadId,
         title: `New ${correctedData.priority} Lead (Human Approved)`,
         message: `${correctedData.name} from ${correctedData.company || 'a company'} was assigned to you.`
       });
    }

    return { success: true, leadId }
  } catch (err: any) {
    console.error("Approve review failed:", err)
    return { success: false, error: err.message }
  }
}

export async function rejectReview(reviewId: string, interactionId: string) {
  const supabase = createAdminClient()
  
  try {
    const { data: userAuth } = await supabase.auth.getUser()
    const userId = userAuth.user?.id

    // Update review queue
    await supabase.from("review_queue").update({
      status: "Rejected",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString()
    }).eq("id", reviewId)

    // Update automation run
    const { data: run } = await supabase
      .from("automation_runs")
      .select("id")
      .eq("interaction_id", interactionId)
      .eq("status", "Needs Review")
      .single()

    if (run) {
      await supabase.from("automation_steps").insert({
        automation_run_id: run.id,
        step_name: "Human Review Rejected",
        status: "Failed",
        error: "Manually rejected by user"
      })

      await supabase.from("automation_runs").update({ 
        status: "Failed",
        current_step: "Rejected",
        completed_at: new Date().toISOString()
      }).eq("id", run.id)
    }

    return { success: true }
  } catch (err: any) {
    console.error("Reject review failed:", err)
    return { success: false, error: err.message }
  }
}
