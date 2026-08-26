import { Activity, CheckCircle2, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import Link from "next/link"

const PAGE_SIZE = 25

export default async function AutomationRunsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const page = Math.max(1, parseInt(String(params?.page || '1')))
  const offset = (page - 1) * PAGE_SIZE

  // Fetch runs and total count
  const [
    { data: runs },
    { count: totalCount }
  ] = await Promise.all([
    supabase
      .from('automation_runs')
      .select(`
        *,
        lead:leads!automation_runs_lead_company_fk(name)
      `)
      .order('started_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase
      .from('automation_runs')
      .select('id', { count: 'exact', head: true })
  ])

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE)

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
                      {run.lead?.name || '-'}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages || 1} • Showing {runs?.length || 0} of {totalCount || 0} runs
          </div>
          <div className="flex gap-2">
            <a
              href={`/automation-runs?page=${Math.max(1, page - 1)}`}
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
              href={`/automation-runs?page=${Math.min(totalPages, page + 1)}`}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                page >= totalPages
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800/50 dark:text-zinc-600'
                  : 'bg-white text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800'
              }`}
              aria-disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
