import { Users, Filter, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export default async function LeadsPage() {
  const supabase = await createClient()

  // Fetch leads and their assigned representative
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      assigned_to:profiles!leads_assigned_to_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="h-6 w-6 text-zinc-500" />
            Leads
          </h1>
          <p className="text-zinc-500 text-sm mt-1">View and manage all your customer enquiries and leads.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800">
            <Filter className="h-4 w-4 text-zinc-500" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Score</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Assigned To</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Created</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {(!leads || leads.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                    No leads yet. Submit your first enquiry to see LeadLoop automate your sales workflow.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:pl-6">
                      {lead.full_name || 'Unknown'}
                      {lead.email && <div className="text-xs text-zinc-500 font-normal">{lead.email}</div>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {lead.company || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{lead.lead_score || 0}/100</span>
                        {lead.priority === 'HOT' && <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400">HOT</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400">
                        {lead.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {/* @ts-ignore */}
                      {lead.assigned_to?.full_name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a href={`/leads/${lead.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View<span className="sr-only">, {lead.full_name}</span>
                      </a>
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
