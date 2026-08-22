import { GitMerge, Settings } from "lucide-react"

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-zinc-500" />
            Workflow Diagram
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Visual representation of the LeadLoop automation pipeline.</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col items-center justify-center min-h-[500px]">
        {/* Placeholder for Mermaid or custom CSS diagram */}
        <div className="text-center text-zinc-500 space-y-4">
           <p>Gmail / Web Form</p>
           <p>↓</p>
           <p>LeadLoop Intake</p>
           <p>↓</p>
           <p>AI Extraction & Qualification</p>
           <p>↓</p>
           <p>Validation & Confidence Check</p>
           <p>↓</p>
           <p>CRM Create / Update</p>
           <p>↓</p>
           <p>Sales Assignment & Follow-Up Task</p>
           <p>↓</p>
           <p>Notification</p>
        </div>
      </div>
    </div>
  )
}
