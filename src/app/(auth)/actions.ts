'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/overview')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const companyName = formData.get('companyName') as string

  if (!email || !password || !name || !companyName) {
    return { error: 'Name, Company, email, and password are required' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: 'ADMIN',
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // After successful signup, securely bootstrap the tenant workspace
  if (data.user) {
     try {
       // 1. Create the company using admin client (bypasses RLS)
       const { data: company, error: companyError } = await adminClient
         .from('companies')
         .insert({ name: companyName })
         .select('id')
         .single()
         
       if (companyError || !company) {
         throw new Error(companyError?.message || 'Failed to create company workspace')
       }
       
       // 2. Create the user profile associated with the new company
       const { error: profileError } = await adminClient
         .from('profiles')
         .upsert({
           id: data.user.id,
           company_id: company.id,
           name: name,
           email: email,
           role: 'ADMIN'
         })
         
       if (profileError) {
         throw new Error(profileError.message)
       }
     } catch (err: any) {
       console.error("Tenant bootstrap error:", err)
       // Note: in a production app, we would ideally roll back the auth.user creation here or handle orphans
     }
  }

  revalidatePath('/', 'layout')
  redirect('/overview')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
