import { ArrowLeft, PlayCircle, Clock, CheckCircle2, XCircle, AlertCircle, Cpu, Database } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function AutomationRunDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: run, error } = await supabase
    .from("automation_runs")
    .select(`
      *,
      leads (id, name, company),
      interactions (id, raw_content, source)
    `)
    .eq("id", params.id)
    .single()

  if (error || !run) {
    notFound()
  }

  const { data: steps } = await supabase
    .from("automation_steps")
    .select("*")
    .eq("automation_run_id", params.id)
    .order("started_at", { ascending: true })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "Needs Review":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-zinc-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "Failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "Needs Review":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
    }
  }

  let parsedInteractionContent = run.interactions?.raw_content
  try {
    const p = JSON.parse(run.interactions?.raw_content || "{}")
    parsedInteractionContent = JSON.stringify(p, null, 2)
  } catch(e) {}

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/automation-runs" className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-500" /> 
              Automation Trace
            </h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(run.status)}`}>
              {run.status}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            Triggered via {run.trigger_type} ({run.source}) on {new Date(run.started_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Raw Input Context */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Trigger Payload</h3>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg font-mono text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
            <pre>{parsedInteractionContent || "No payload recorded."}</pre>
          </div>
        </div>

        {/* Execution Steps */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Execution Steps</h3>
          <div className="space-y-8">
            {steps && steps.length > 0 ? (
              steps.map((step, idx) => (
                <div key={step.id} className="relative pl-8">
                  {/* Timeline connecting line */}
                  {idx !== steps.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-32px] w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  
                  {/* Step icon */}
                  <div className="absolute -left-[1px] top-0 bg-white dark:bg-zinc-900">
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{step.step_name}</h4>
                    <span className="text-xs text-zinc-500 font-mono">
                      {step.completed_at 
                        ? `${(new Date(step.completed_at).getTime() - new Date(step.started_at).getTime())}ms`
                        : 'Running...'}
                    </span>
                  </div>

                  {step.error && (
                    <div className="bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 text-xs p-3 rounded-md mb-3 border border-red-100 dark:border-red-900">
                      {step.error}
                    </div>
                  )}

                  {step.output && (
                    <div className="mt-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-3 rounded-md overflow-hidden">
                      <details>
                        <summary className="text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200">
                          View Output Data
                        </summary>
                        <pre className="mt-3 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 italic">No execution steps recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
