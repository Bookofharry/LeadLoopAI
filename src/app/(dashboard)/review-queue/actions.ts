"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { AIQualificationResult } from "@/lib/services/ai"
import { hasRequiredLeadContact } from "@/lib/services/leadValidation"

export async function getPendingReviewCount() {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from("review_queue")
    .select("id", { count: 'exact', head: true })
    .eq("status", "Pending")

  if (error) {
    console.error("Failed to fetch pending count:", error)
    return 0
  }

  return count || 0
}

export async function getReviews() {
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
      reviewed_by,
      reviewed_at,
      interactions (
        id,
        source,
        raw_content
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch reviews:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function approveReview(reviewId: string, correctedData: AIQualificationResult, interactionId: string) {
  // Use admin client since we are finalizing a backend workflow
  const supabase = createAdminClient()

  try {
    if (!hasRequiredLeadContact(correctedData.email, correctedData.phone)) {
      return {
        success: false,
        error: "Add a valid email address or phone number before approving this lead.",
      }
    }

    const { data: userAuth } = await supabase.auth.getUser()
    const userId = userAuth.user?.id

    // 0. Fetch the company_id and status from the review record to ensure strict multi-tenant propagation and idempotency
    const { data: reviewRecord } = await supabase
      .from("review_queue")
      .select("company_id, status")
      .eq("id", reviewId)
      .single()
    const companyId = reviewRecord?.company_id

    if (!companyId) throw new Error("Missing company_id on review record")
    
    // Idempotency check: PENDING -> PROCESSING
    if (reviewRecord.status !== "Pending") {
      return { success: true, message: "Review already processed" } // Safely return if double clicked
    }

    // Atomic update to prevent double processing
    const { data: updateCheck } = await supabase
      .from("review_queue")
      .update({ status: "Processing", reviewed_by: userId })
      .eq("id", reviewId)
      .eq("status", "Pending")
      .select("id")
      .single()
      
    if (!updateCheck) {
      return { success: true, message: "Review already processed concurrently" }
    }

    // 1. Fetch the interaction to get the source
    const { data: interaction } = await supabase.from("interactions").select("source").eq("id", interactionId).single()
    const source = interaction?.source || "REVIEW_QUEUE"

    // 2. Fetch automation run ID
    const { data: run } = await supabase
      .from("automation_runs")
      .select("id")
      .eq("interaction_id", interactionId)
      .eq("status", "Needs Review")
      .single()
      
    const runId = run?.id;
    if (!runId) {
      // If we can't find it, that's an anomaly but we shouldn't crash if we can just continue
      console.warn("Could not find automation run for interaction:", interactionId);
    }

    // 3. Delegate to shared processing logic
    const { continueLeadProcessing } = await import("@/lib/services/processIncomingLead");
    
    const result = await continueLeadProcessing(
      companyId,
      source as any,
      correctedData as any,
      interactionId,
      runId || "",
      true // isHumanApproved
    );

    // 4. Update the review_queue status
    await supabase.from("review_queue").update({
      status: "Approved",
      reviewed_at: new Date().toISOString(),
      extracted_data: correctedData // save the final version
    }).eq("id", reviewId)

    return { success: true, leadId: result.leadId }
  } catch (err: any) {
    console.error("Approve review failed:", err)
    
    // Attempt to rollback the Processing state if it failed so it can be retried
    const supabase = createAdminClient()
    await supabase.from("review_queue").update({ status: "Pending" }).eq("id", reviewId)
    
    return { success: false, error: err.message }
  }
}

export async function rejectReview(reviewId: string, interactionId: string, reason?: string) {
  const supabase = createAdminClient()
  
  try {
    const { data: userAuth } = await supabase.auth.getUser()
    const userId = userAuth.user?.id

    const { data: reviewRecord } = await supabase
      .from("review_queue")
      .select("company_id, status")
      .eq("id", reviewId)
      .single()
    const companyId = reviewRecord?.company_id

    if (!companyId) throw new Error("Missing company_id on review record")
    
    if (reviewRecord.status !== "Pending") {
      return { success: true, message: "Review already processed" }
    }

    // Update review queue
    await supabase.from("review_queue").update({
      status: "Rejected",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString()
      // reason could be added to DB schema, omitted for now
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
        company_id: companyId,
        automation_run_id: run.id,
        step_name: "Human Review Rejected",
        status: "Success", // Note: The user asked to treat human rejection as REJECTED, not FAILED, unless an actual technical failure occurs.
        error: reason || "Manually rejected by user" // Store reason here
      })

      await supabase.from("automation_runs").update({ 
        status: "Rejected",
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
