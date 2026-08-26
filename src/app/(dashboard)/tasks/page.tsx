import { CheckSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TaskItem } from "./TaskItem"

const TASK_PAGE_SIZE = 20

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const page = Math.max(1, parseInt(String(params?.page || '1')))
  const offset = (page - 1) * TASK_PAGE_SIZE

  // Fetch pending and completed tasks with limits
  const [
    { data: allTasks },
    { count: pendingCount },
    { count: completedCount }
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select(`
        *,
        lead:leads!tasks_lead_company_fk(id, name, company),
        assigned_to:profiles!tasks_assigned_to_company_fk(name)
      `)
      .order('due_at', { ascending: true })
      .limit(TASK_PAGE_SIZE * 2), // Fetch enough to split between pending/completed
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Pending'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Completed')
  ])

  const pendingTasks = allTasks?.filter(t => t.status === 'Pending') || []
  const completedTasks = allTasks?.filter(t => t.status === 'Completed') || []

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
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Pending Tasks ({pendingCount || 0})</h2>
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
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Completed Tasks ({completedCount || 0})</h2>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Page {page} • Pending: {pendingCount || 0} • Completed: {completedCount || 0}
        </div>
        <div className="flex gap-2">
          <a
            href={`/tasks?page=${Math.max(1, page - 1)}`}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
              page === 1
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800/50 dark:text-zinc-600'
                : 'bg-white text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800'
            }`}
            aria-disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </a>
          <a
            href={`/tasks?page=${page + 1}`}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
