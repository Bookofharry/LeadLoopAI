import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

export interface AIQualificationResult {
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  service: string | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  intent: "High" | "Medium" | "Low" | null;
  summary: string;
  lead_score: number;
  priority: "HOT" | "WARM" | "COLD" | null;
  recommended_action: string;
  confidence: number;
  missing_fields: string[];
}

export async function processCustomerEnquiry(rawContent: string): Promise<AIQualificationResult> {
  const prompt = `
You are an expert AI sales assistant for a B2B SaaS CRM named LeadLoop.
Your job is to read an unstructured customer enquiry and extract structured information, evaluate the lead's intent, and provide a recommendation.

Customer Enquiry:
"""
${rawContent}
"""

Please respond ONLY with a raw JSON object matching the following structure (do not use markdown blocks):
{
  "name": "Extracted full name, or null if missing",
  "company": "Extracted company, or null if missing",
  "email": "Extracted email, or null if missing",
  "phone": "Extracted phone, or null if missing",
  "location": "Extracted location, or null if missing",
  "service": "What service or product they want, or null if missing",
  "budget_min": Number (e.g. 8000000) or null,
  "budget_max": Number (e.g. 10000000) or null,
  "timeline": "Extracted timeline (e.g. 'Next month'), or null if missing",
  "intent": "High", "Medium", or "Low",
  "summary": "A 1-2 sentence concise summary of the enquiry.",
  "lead_score": A number between 0 and 100 based on how qualified this lead is (budget, intent, details),
  "priority": "HOT", "WARM", or "COLD" (score > 80 is HOT),
  "recommended_action": "A clear, concise recommended next action for the sales rep.",
  "confidence": A float between 0.0 and 1.0 representing how confident you are in your extraction. (If major fields like service or contact info are missing, lower this below 0.7),
  "missing_fields": ["List of strings of important fields that are missing, e.g., 'service', 'budget', 'phone'"]
}
`;

  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("AI Agent is not configured");
  }

  console.log("AI provider: Mistral AI model: mistral-large-latest");
  console.log("AI extraction started");

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });

    const resultText = chatResponse.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("The AI Agent returned an empty response");
    
    // Ensure it's a string, since Mistral SDK typing for content might vary slightly
    const textContent = typeof resultText === 'string' ? resultText : JSON.stringify(resultText);
    const result = JSON.parse(textContent) as AIQualificationResult;
    
    console.log("AI extraction completed");
    return result;
  } catch (error) {
    console.error("AI processing failed:", error);
    throw error;
  }
}


