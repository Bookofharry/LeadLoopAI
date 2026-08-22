'use client'

import { format } from "date-fns"
import { CheckCircle2, Circle } from "lucide-react"
import { useTransition } from "react"
import { markTaskCompleted } from "./actions"

export function TaskItem({ task }: { task: any }) {
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    if (task.status === 'COMPLETED') return;
    startTransition(async () => {
      await markTaskCompleted(task.id)
    })
  }

  const isCompleted = task.status === 'COMPLETED'
  
  return (
    <div className={`p-4 flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${isCompleted ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-900'}`}>
      <button 
        onClick={handleComplete}
        disabled={isPending || isCompleted}
        className="mt-0.5 text-zinc-400 hover:text-green-500 transition-colors disabled:cursor-not-allowed"
      >
        {isPending ? (
          <div className="h-5 w-5 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm font-medium ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {task.title}
          </h4>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            task.priority === 'HOT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            task.priority === 'WARM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            {task.priority}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Due: {task.due_at ? format(new Date(task.due_at), 'MMM d, yyyy HH:mm') : 'No date'}
        </p>
        {task.lead && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-medium hover:underline cursor-pointer">
            <a href={`/leads/${task.lead.id}`}>{task.lead.full_name} ({task.lead.company})</a>
          </p>
        )}
      </div>
    </div>
  )
}
