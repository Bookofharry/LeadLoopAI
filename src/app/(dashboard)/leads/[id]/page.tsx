import { ArrowLeft, UserCircle, MapPin, Briefcase, Phone, Mail, CheckCircle2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. Fetch Lead & Joined Profile
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select(`
      *,
      profiles!leads_assigned_to_company_fk (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (leadError || !lead) {
    notFound()
  }

  // 2. Fetch Interactions (Timeline)
  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })

  // 3. Format Currency
  const formatCurrency = (val: number | null) => {
    if (!val) return "Unknown"
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(val)
  }

  // Formatting assigned rep initials
  const repName = lead.profiles?.name || "Unassigned"
  const repInitials = repName !== "Unassigned" 
    ? repName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "?"

  const scoreColor = lead.lead_score >= 80 ? "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400" 
                   : lead.lead_score >= 50 ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                   : "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/leads" className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{lead.name || "Unknown Lead"}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreColor}`}>
              {lead.priority || "COLD"} — {lead.lead_score || 0}/100
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">{lead.company || "No Company provided"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary */}
          {lead.ai_summary && (
            <div className="rounded-xl border border-zinc-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-900/20 dark:bg-blue-950/10">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                AI Summary
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                {lead.ai_summary}
              </p>
            </div>
          )}

          {/* AI Reasoning / Data Extracted */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">AI Extraction Details</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <strong>Intent:</strong> {lead.intent || "Unknown"}
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <strong>Confidence:</strong> {lead.ai_confidence ? (lead.ai_confidence * 100).toFixed(0) + "%" : "Unknown"}
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <strong>Source:</strong> {lead.source || "Unknown"}
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Interaction Timeline</h3>
            <div className="space-y-6">
               {interactions && interactions.length > 0 ? (
                 interactions.map((interaction, idx) => {
                   let parsedContent = interaction.raw_content;
                   try { parsedContent = JSON.parse(interaction.raw_content).message || parsedContent } catch (e) {}

                   return (
                     <div key={interaction.id} className="relative pl-6 pb-6 border-l border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                       <div className="absolute -left-[17px] top-0 h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                         <MessageSquare className="h-3 w-3 text-zinc-500" />
                       </div>
                       <div className="mb-1">
                         <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{interaction.source}</span>
                         <span className="text-xs text-zinc-500 ml-3">{new Date(interaction.created_at).toLocaleString()}</span>
                       </div>
                       <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 mt-2">
                         "{parsedContent}"
                       </p>
                     </div>
                   )
                 })
               ) : (
                 <p className="text-sm text-zinc-500 italic">No interactions recorded.</p>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Contact Information</h3>
            <dl className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <UserCircle className="h-4 w-4 text-zinc-400" />
                <dt className="sr-only">Name</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{lead.name}</dd>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-400" />
                <dt className="sr-only">Email</dt>
                <dd>{lead.email || "—"}</dd>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <Phone className="h-4 w-4 text-zinc-400" />
                <dt className="sr-only">Phone</dt>
                <dd>{lead.phone || "—"}</dd>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <Briefcase className="h-4 w-4 text-zinc-400" />
                <dt className="sr-only">Company</dt>
                <dd>{lead.company || "—"}</dd>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <dt className="sr-only">Location</dt>
                <dd>{lead.location || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Opportunity Details */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Opportunity</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400 mb-1">Service Requested</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{lead.service || "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400 mb-1">Budget</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {lead.budget_min ? formatCurrency(lead.budget_min) : "Unknown"} - {lead.budget_max ? formatCurrency(lead.budget_max) : "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400 mb-1">Timeline</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{lead.timeline || "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400 mb-1">Assigned Rep</dt>
                <dd className="font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-100 mt-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                    {repInitials}
                  </div>
                  {repName}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
