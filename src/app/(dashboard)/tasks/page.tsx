import { CheckSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TaskItem } from "./TaskItem"

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      lead:leads(id, full_name, company),
      assigned_to:profiles!tasks_assigned_to_fkey(full_name)
    `)
    .order('due_at', { ascending: true })

  const pendingTasks = tasks?.filter(t => t.status === 'PENDING') || []
  const completedTasks = tasks?.filter(t => t.status === 'COMPLETED') || []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-zinc-500" />
            Tasks
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your follow-ups and action items.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Pending Tasks ({pendingTasks.length})</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No pending tasks found. You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pendingTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Completed Tasks ({completedTasks.length})</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 opacity-80 hover:opacity-100 transition-opacity">
            {completedTasks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No completed tasks yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
