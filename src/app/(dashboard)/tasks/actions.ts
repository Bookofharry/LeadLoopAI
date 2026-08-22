'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markTaskCompleted(taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    })
    .eq('id', taskId)
    
  if (error) {
    console.error("Failed to complete task:", error)
    return { error: error.message }
  }
  
  revalidatePath('/tasks')
  revalidatePath('/overview')
}
