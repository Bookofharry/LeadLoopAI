'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPendingTaskCount() {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Pending')

  if (error) {
    console.error('Failed to fetch pending task count:', error)
    return 0
  }

  return count || 0
}

export async function markTaskCompleted(taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: 'Completed',
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
