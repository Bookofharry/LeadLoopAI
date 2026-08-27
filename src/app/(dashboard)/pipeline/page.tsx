import { KanbanSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

// Map UI column names to DB status values
const columns = [
  { label: "New", value: "NEW" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Proposal", value: "PROPOSAL" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" }
]

export default async function PipelinePage() {
  const supabase = await createClient()

  // Fetch leads per status using parallel queries (more efficient)
  // Use `name` and `assigned_to.name` — matches the DB `leads.name` and `profiles.name` columns.
  const leadsByStatus = await Promise.all(
    columns.map(async (col) => {
      const { data } = await supabase
        .from('leads')
        .select(`
          id, name, company, lead_score, priority, budget_min, budget_max, status,
          assigned_to:profiles!leads_assigned_to_fkey(name)
        `)
        .eq('status', col.value)
        .order('created_at', { ascending: false })
      return { [col.value]: data || [] }
    })
  ).then(results => Object.assign({}, ...results))

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-zinc-500" />
            Pipeline
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track your leads through the sales stages.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="inline-flex h-full items-start space-x-4 pb-4">
          {columns.map((column) => {
            const columnLeads = leadsByStatus[column.value] || []
            
            return (
              <div
                key={column.value}
                className="flex h-full w-80 flex-col rounded-xl bg-zinc-100/80 dark:bg-zinc-900/50 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{column.label}</h3>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                  {columnLeads.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 opacity-50 border-dashed flex items-center justify-center text-xs text-zinc-500 py-6">
                      No leads in {column.label}
                    </div>
                    ) : (
                    columnLeads.map((lead: any) => (
                      <a href={`/leads/${lead.id}`} key={lead.id} className="block rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{lead.name || 'Unknown'}</h4>
                          {lead.priority === 'HOT' && (
                            <span className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mb-3 truncate">{lead.company || 'No Company'}</p>
                        
                        <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Score: {lead.lead_score || 0}</span>
                          </div>
                          <div>
                            {/* @ts-ignore */}
                            {lead.assigned_to?.name?.split(' ')[0] || 'Unassigned'}
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
