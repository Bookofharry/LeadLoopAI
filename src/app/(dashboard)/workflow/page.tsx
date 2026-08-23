import { GitMerge } from "lucide-react"
import WorkflowClient from "./WorkflowClient"
import Link from "next/link"

export default function WorkflowPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Automation Architecture</span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-1">
            Watch LeadLoop work.
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-2xl font-medium">
            See how an enquiry becomes an actionable CRM opportunity.
          </p>
        </div>

        <Link
          href="/automation-runs"
          className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 transition-colors"
        >
          View Live Executions
        </Link>
      </div>

      <div className="flex-1 min-h-[600px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <WorkflowClient />
      </div>
    </div>
  )
}
