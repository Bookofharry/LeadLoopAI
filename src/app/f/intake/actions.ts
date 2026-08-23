"use server"

import { processIncomingLead } from "@/lib/services/processIncomingLead";
import { createClient } from "@/lib/supabase/server";

export async function submitManualIntake(rawContent: string) {
  try {
    if (!rawContent) {
      throw new Error("Missing content");
    }

    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userAuth.user.id)
      .single();

    if (!profile || !profile.company_id) {
      throw new Error("User has no associated company workspace");
    }

    const result = await processIncomingLead({
      companyId: profile.company_id,
      source: "MANUAL",
      rawContent
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("Manual intake error:", error);
    return { success: false, error: error.message || "Failed to process lead" };
  }
}
