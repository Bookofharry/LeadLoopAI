"use server"

import { processIncomingLead } from "@/lib/services/processIncomingLead";

export async function submitManualIntake(rawContent: string) {
  try {
    if (!rawContent) {
      throw new Error("Missing content");
    }

    const result = await processIncomingLead({
      source: "MANUAL",
      rawContent
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("Manual intake error:", error);
    return { success: false, error: error.message || "Failed to process lead" };
  }
}
