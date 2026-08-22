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

  const { data, error } = await supabase
    .from("integrations")
    .insert({
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
