"use client"

import { useState, useEffect } from "react"
import { Blocks, Mail, Send, Database, Globe, Code2, Copy, Check, Key, CheckCircle2, AlertTriangle, X } from "lucide-react"
import { generateIntegrationKey } from "./actions"

export default function IntegrationsPage() {
  const [showWebFormGuide, setShowWebFormGuide] = useState(false)
  const [copied, setCopied] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [baseUrl, setBaseUrl] = useState("https://your-leadloop-domain.com")
  const [showWarningModal, setShowWarningModal] = useState(false)

  // Use useEffect to grab the actual domain on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const integrations = [
    {
      name: 'Gmail',
      description: 'Automatically process incoming lead emails.',
      status: 'Not Connected',
      icon: Mail,
      color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    },
    {
      name: 'Telegram',
      description: 'Notify sales representatives about new leads and escalations.',
      status: 'Not Connected',
      icon: Send,
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
    },
    {
      name: 'Website Forms',
      description: 'Capture leads directly from your own website enquiries via webhook.',
      status: 'Available',
      icon: Globe,
      color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      action: () => setShowWebFormGuide(!showWebFormGuide)
    },
    {
      name: 'Supabase',
      description: 'CRM database, authentication and application data.',
      status: 'Connected',
      icon: Database,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    }
  ]

  const snippet = `// 1. Gather the message or form data
const customerMessage = "Hello, I need pricing for 50 users.";

// 2. Send it to LeadLoop AI for processing
await fetch('${baseUrl}/api/webhooks/intake', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey || "YOUR_INTEGRATION_KEY"}'
  },
  body: JSON.stringify({
    source: "WEBSITE_FORM",
    rawContent: customerMessage,
    structuredData: {
      fullName: "Jane Doe",
      email: "jane@example.com"
    }
  })
});`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
    }
  }

  const handleGenerateKey = async () => {
    setShowWarningModal(false)
    setLoading(true)
    try {
      const res = await generateIntegrationKey("Company Website", "WEBSITE_FORM")
      if (res.success) {
        setApiKey(res.rawToken!)
      } else {
        alert("Failed to generate key: " + res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Modal Overlay */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Security Warning
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                For your security, we only display the raw API key exactly <strong>ONCE</strong>. 
                If you lose it, you will have to generate a new one. Are you ready to copy and securely store your new API key?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateKey}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Yes, Generate Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Blocks className="h-6 w-6 text-zinc-500" />
            Integrations
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Connect LeadLoop with your existing tools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => (
          <div key={integration.name} className="relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${integration.color}`}>
                  <integration.icon className="h-6 w-6" />
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  integration.status === 'Active' || integration.status === 'Connected' || integration.status === 'Available'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {integration.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{integration.name}</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{integration.description}</p>
            </div>
            <div className="mt-6">
              <button 
                onClick={integration.action}
                className={`w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${
                  integration.status === 'Active' || integration.status === 'Connected' || integration.status === 'Available'
                    ? 'bg-white text-zinc-900 ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800'
                    : 'bg-blue-600 text-white ring-blue-600 hover:bg-blue-500'
                }`}
              >
                {integration.status === 'Available' ? 'Configure' : integration.status === 'Connected' ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showWebFormGuide && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Website Webhook Integration</h3>
                
                {!apiKey && (
                  <button 
                    onClick={() => setShowWarningModal(true)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Key className="h-4 w-4" /> {loading ? "Generating..." : "Generate Integration Key"}
                  </button>
                )}
              </div>

              {apiKey && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 rounded-lg">
                  <p className="text-sm font-bold text-green-900 dark:text-green-300 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" /> Secret Key Generated!
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-400 mb-2">
                    Please copy this key immediately. For security reasons, we will not show it to you again.
                  </p>
                  <div className="relative group">
                    <code className="block bg-white dark:bg-zinc-950 px-3 py-3 pr-12 rounded text-sm text-zinc-900 dark:text-zinc-100 border border-green-200 dark:border-green-900/50 break-all select-all">
                      {apiKey}
                    </code>
                    <button 
                      onClick={handleCopyKey}
                      className="absolute right-2 top-2 p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      title="Copy API Key"
                    >
                      {keyCopied ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-1 text-sm text-blue-800 dark:text-blue-400/80 mb-6">
                You can easily connect your own custom frontend forms to LeadLoop AI. Send the entire raw customer message to our webhook, and LeadLoop AI will automatically structure and qualify it.
              </p>
              
              <div className="relative group">
                <div className="absolute right-4 top-4">
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <pre className="bg-zinc-950 text-zinc-300 p-6 rounded-lg text-sm font-mono overflow-x-auto shadow-inner border border-zinc-800">
                  <code>{snippet}</code>
                </pre>
              </div>
              
              <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Endpoint Details</h4>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                  <li><strong className="text-zinc-900 dark:text-zinc-200">URL:</strong> <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400">/api/webhooks/intake</code></li>
                  <li><strong className="text-zinc-900 dark:text-zinc-200">Method:</strong> POST</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-200">Payload:</strong> Requires <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">rawContent</code>. Optionally provide <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">structuredData</code> for fields you already know (like email).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
