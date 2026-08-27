"use client"

import { useState, useEffect } from "react"
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, UserCircle, Briefcase, FileSearch } from "lucide-react"
import { submitManualIntake } from "./actions"
import Link from "next/link"

const PROCESSING_STEPS = ['Queued', 'AI Extraction', 'Confidence Check', 'Human Review Required', 'CRM Update', 'Task Creation', 'Notification', 'Completed']

export default function ManualIntakeForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProgress(4)

    const formData = new FormData(e.currentTarget)
    const rawContent = formData.get("raw_content") as string

    try {
      const res = await submitManualIntake(rawContent)
      if (res.success) {
        setResult(res.result)
      } else {
        setError(res.error || "Failed to process lead")
      }
    } catch (err: any) {
      console.error(err)
      setError("Error submitting form.")
    } finally {
      setLoading(false)
    }
  }

  // Poll automation run if processing was queued
  const runId = result?.status === 'RUNNING' ? result.automationRunId : null
  const currentStep = runId ? (result?.current_step || result?.run?.current_step || 'Queued') : null

  useEffect(() => {
    if (!runId) return

    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    let completionTimer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const res = await fetch(`/api/automation-runs/${runId}`);
        const j = await res.json();
        if (cancelled) return
        if (j.success && j.run) {
          // update current step for live progress UI
          setResult((prev: any) => ({ ...(prev || {}), current_step: j.run.current_step, run: j.run } as any))
          const stepIndex = Math.max(0, PROCESSING_STEPS.indexOf(j.run.current_step || 'Queued'))
          const milestone = Math.round(((stepIndex + 1) / PROCESSING_STEPS.length) * 94)
          setProgress((value) => Math.max(value, milestone))
          const status = String(j.run.status || '').toUpperCase()
          if (status === 'SUCCESS') {
            setProgress(100)
            completionTimer = setTimeout(() => {
              if (!cancelled) {
                setResult((prev: any) => ({ ...(prev || {}), status: 'SUCCESS', leadId: j.run.lead_id, aiResult: null, assignedRep: j.run.lead?.name || null } as any))
              }
            }, 650)
          } else if (status === 'NEEDS REVIEW' || status === 'NEEDS_REVIEW') {
            setProgress(100)
            completionTimer = setTimeout(() => {
              if (!cancelled) setResult((prev: any) => ({ ...(prev || {}), status: 'NEEDS_REVIEW' } as any))
            }, 650)
          } else if (status === 'FAILED') {
            setError(j.run.error_message || 'Processing failed')
            setResult(null)
          } else {
            pollTimer = setTimeout(poll, 1200)
          }
        } else {
          pollTimer = setTimeout(poll, 1200)
        }
      } catch (err) {
        console.error('poll error', err)
        if (!cancelled) pollTimer = setTimeout(poll, 2000)
      }
    }

    poll()
    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
      if (completionTimer) clearTimeout(completionTimer)
    }
  }, [runId])

  // Keep the indicator moving between real backend milestones without claiming completion early.
  useEffect(() => {
    if (!runId) return
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 94) return value
        const remaining = 94 - value
        return Math.min(94, value + Math.max(0.35, remaining * 0.035))
      })
    }, 350)
    return () => clearInterval(timer)
  }, [runId])

  if (result?.status === 'RUNNING') {
    const current = currentStep || 'Queued'
    const displayedPercent = Math.round(progress)

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Processing Lead</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">LeadLoop is processing the lead in the background. This usually completes in a few seconds.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Current step: <strong className="text-zinc-900 dark:text-zinc-100">{current}</strong></div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 bg-blue-600 dark:bg-blue-400 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 text-xs text-zinc-500 flex justify-between">
              <span>Progress</span>
              <span>{displayedPercent}%</span>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold">Refresh</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT STATES ---

  if (result?.status === "SUCCESS") {
    const ai = result.aiResult;
    const scoreColor = ai?.priority === "HOT" ? "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400" 
                   : ai?.priority === "WARM" ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                   : "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"

    const formatCurrency = (val: number | null) => {
      if (!val) return "Unknown"
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(val)
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4 shadow-inner">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Lead Captured</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">The AI Agent successfully extracted and structured this opportunity.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  {ai?.name || "Unknown Lead"}
                </h2>
                <p className="text-zinc-500 mt-1 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> {ai?.company || "No Company"}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${scoreColor}`}>
                  {ai?.priority === "HOT" && "🔥 "} {ai?.priority || "COLD"}
                </span>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{ai?.lead_score || 0} / 100</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Service</dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{ai?.service || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Budget</dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                  {ai?.budget_min ? formatCurrency(ai?.budget_min) : "Unknown"} - {ai?.budget_max ? formatCurrency(ai?.budget_max) : "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Assignment</dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-indigo-500" /> {result.assignedRep}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Follow-Up Task</dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Created
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/leads/${result.leadId}`}
              className="flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all"
            >
              View Lead <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href={`/automation-runs/${result.automationRunId}`}
              className="flex items-center justify-center gap-2 rounded-full bg-white border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              View Automation Trace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (result?.status === "NEEDS_REVIEW") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-2">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Human Review Required</h1>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            LeadLoop couldn&apos;t confidently identify enough information to safely complete this automation.
          </p>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 text-left shadow-sm">
            <p className="text-sm text-zinc-500 mb-4"><strong>AI Confidence:</strong> {((result.aiResult?.confidence || 0) * 100).toFixed(0)}%</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Missing Information:</p>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-500">
                {result.aiResult?.missing_fields?.map((field: string) => (
                  <li key={field}>{field}</li>
                )) || <li>Unknown</li>}
              </ul>
            </div>
          </div>

          <Link 
            href="/review-queue"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-all"
          >
            Open Review Queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // --- CAPTURE FORM ---

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-6">
           <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FileSearch className="h-5 w-5" />
            </div>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Capture a Lead
        </h2>
        <p className="mt-3 text-center text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
          Paste any customer conversation, email, message, or sales note. LeadLoop AI will extract the important details and turn it into an actionable CRM opportunity.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="raw_content" className="block text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Customer Conversation
              </label>
              <div className="mt-2">
                <textarea 
                  id="raw_content" 
                  name="raw_content" 
                  rows={10} 
                  required 
                  placeholder={"Paste an email, WhatsApp conversation, SMS, meeting note, phone call note, or other customer enquiry...\n\nExample:\n\nFrom: David Okafor <david@example.com>\n\nHi, we're looking to install solar for our 20-room guesthouse in Lekki. Our budget is around ₦8m–₦10m and we'd like this completed next month. Please call me tomorrow afternoon.\n\nDavid\n+234..."} 
                  className="block w-full rounded-xl border-0 py-3 px-4 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-800" 
                />
              </div>
              <p className="mt-3 text-xs text-zinc-500 flex items-center flex-wrap gap-2">
                <strong className="text-zinc-700 dark:text-zinc-300">LeadLoop can automatically identify:</strong> 
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Contact</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Company</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Requirement</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Budget</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Timeline</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Purchase Intent</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" /> Processing with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" /> Process with AI
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
