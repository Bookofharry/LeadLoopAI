"use server"

import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function generateIntegrationKey(name: string, type: string) {
  const supabase = await createClient()

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const { data: userAuth } = await supabase.auth.getUser()
  const userId = userAuth.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .single()

  if (!profile?.company_id) {
    return { success: false, error: "Company not found for user" }
  }

  const { data, error } = await supabase
    .from("integrations")
    .insert({
      company_id: profile.company_id,
      name,
      type,
      api_key_hash: tokenHash,
      created_by: userId,
      status: "Active"
    })
    .select("id")
    .single()

  if (error) {
    console.error("Failed to create integration:", error)
    return { success: false, error: error.message }
  }

  // Return the raw token EXACTLY ONCE
  return { success: true, rawToken }
}
