'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: 'SALES_REP',
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // After successful signup, we need to ensure the profile exists.
  // We can insert it directly here if the session exists, or rely on a trigger.
  // The trigger is safer, but we'll insert manually here just in case the trigger isn't set up.
  if (data.user) {
     const { error: profileError } = await supabase
       .from('profiles')
       .upsert({
         id: data.user.id,
         name: name,
         email: email,
         role: 'SALES_REP'
       })
       
     if (profileError) {
       console.error("Failed to create profile", profileError)
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
