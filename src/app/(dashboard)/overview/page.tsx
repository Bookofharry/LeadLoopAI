import { 
  Users, 
  Flame, 
  CalendarClock, 
  Activity,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, isToday } from "date-fns"
import Link from "next/link"

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Total Leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // 2. New Leads
  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'NEW')

  // 3. Hot Leads
  const { count: hotLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('priority', 'HOT')

  // 4. Follow-Ups Due
  const { count: followUpsDue } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  // 5. Needs Review
  const { count: needsReview } = await supabase
    .from('review_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  // 6. Automations Today
  // Get all automation runs, then filter in memory for today as a simple approach
  const { data: allRuns } = await supabase
    .from('automation_runs')
    .select('created_at, status')
  
  const automationsToday = allRuns?.filter(run => run.created_at && isToday(new Date(run.created_at))) || []
  const successfulAutomations = automationsToday.filter(run => run.status === 'SUCCESS').length
  const totalAutomationsToday = automationsToday.length

  // Recent Leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select(`
      id, full_name, company, source, lead_score, priority, status, created_at,
      assigned_to:profiles!leads_assigned_to_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent Automation Activity
  const { data: recentRuns } = await supabase
    .from('automation_runs')
    .select(`
      id, trigger_type, source, status, current_step, started_at,
      lead:leads(full_name)
    `)
    .order('started_at', { ascending: false })
    .limit(5)

  const metrics = [
    { name: 'Total Leads', value: totalLeads || 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'New Leads', value: newLeads || 0, icon: PlusCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { name: 'Hot Leads', value: hotLeads || 0, icon: Flame, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { name: 'Follow-ups Due', value: followUpsDue || 0, icon: CalendarClock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { name: 'Needs Review', value: needsReview || 0, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', alert: (needsReview || 0) > 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-500">Automations Today:</span>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400">
            {successfulAutomations} / {totalAutomationsToday} successful
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((item) => (
          <div
            key={item.name}
            className={`relative overflow-hidden rounded-xl border p-5 shadow-sm transition-colors ${
              item.alert ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <dt>
              <div className={`absolute rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className={`text-2xl font-semibold ${item.alert ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
                {item.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
              Recent Leads
            </h3>
            <Link href="/leads" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {(!recentLeads || recentLeads.length === 0) ? (
              <div className="px-6 py-12 flex flex-col items-center justify-center text-sm text-zinc-500">
                <p className="mb-4">No leads yet. Submit your first enquiry to see LeadLoop automate your sales workflow.</p>
                <Link 
                  href="/f/intake" 
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Submit Test Enquiry
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-white dark:bg-zinc-900">
                  <tr>
                    <th scope="col" className="py-3 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Lead</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Score</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Status</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{lead.full_name}</div>
                        <div className="text-zinc-500">{lead.company}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.lead_score || 0}</span>
                          {lead.priority === 'HOT' && <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400">HOT</span>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                         <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400">
                          {lead.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                        {/* @ts-ignore */}
                        {lead.assigned_to?.full_name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
              Automation Activity
            </h3>
            <Link href="/automation-runs" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="flex-1 p-0">
             {(!recentRuns || recentRuns.length === 0) ? (
                <div className="flex flex-col items-center justify-center text-sm text-zinc-500 h-full min-h-[200px]">
                  <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p>Waiting for first event...</p>
                </div>
             ) : (
                <ul role="list" className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {recentRuns.map((run) => (
                    <li key={run.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <div className="flex space-x-3">
                        {run.status === 'SUCCESS' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : run.status === 'FAILED' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : run.status === 'NEEDS_REVIEW' ? (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {/* @ts-ignore */}
                              {run.lead?.full_name ? `Processed: ${run.lead.full_name}` : `Source: ${run.source}`}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              {run.started_at ? format(new Date(run.started_at), 'HH:mm') : ''}
                            </p>
                          </div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Status: <span className="font-medium text-zinc-900 dark:text-zinc-300">{run.status}</span>
                            {run.current_step && ` • ${run.current_step}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
