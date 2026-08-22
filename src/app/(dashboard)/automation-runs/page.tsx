import { Activity, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import Link from "next/link"

export default async function AutomationRunsPage() {
  const supabase = await createClient()

  const { data: runs } = await supabase
    .from('automation_runs')
    .select(`
      *,
      lead:leads(full_name)
    `)
    .order('started_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="h-6 w-6 text-zinc-500" />
            Automation Runs
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Observable trace of every automated workflow step.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:pl-6">Run ID</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trigger</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Source</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lead</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Started</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {(!runs || runs.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                    No automation runs yet. Submit a lead to trigger the workflow.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:pl-6 font-mono text-xs">
                      {run.id.split('-')[0]}...
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {run.trigger_type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {run.source}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {/* @ts-ignore */}
                      {run.lead?.full_name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {run.status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {run.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                        {run.status === 'NEEDS_REVIEW' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        {run.status === 'RUNNING' && <Clock className="h-4 w-4 text-blue-500" />}
                        <span className={`font-medium ${
                          run.status === 'SUCCESS' ? 'text-green-700 dark:text-green-400' :
                          run.status === 'FAILED' ? 'text-red-700 dark:text-red-400' :
                          run.status === 'NEEDS_REVIEW' ? 'text-amber-700 dark:text-amber-400' :
                          'text-blue-700 dark:text-blue-400'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                      {run.current_step && (
                        <div className="text-xs text-zinc-500 mt-1">{run.current_step}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {run.started_at ? format(new Date(run.started_at), 'MMM d, HH:mm') : '-'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/automation-runs/${run.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Details<span className="sr-only">, run {run.id}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
