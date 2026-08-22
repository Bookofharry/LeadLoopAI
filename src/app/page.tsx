"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Bot, 
  Zap, 
  Target, 
  LineChart, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  Clock, 
  Check, 
  Database,
  Globe,
  Send,
  KanbanSquare,
  Activity,
  ArrowDown
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* ---------------- NAVIGATION ---------------- */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                  <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                  <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              LeadLoop<span className="text-blue-600">AI</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-4 lg:gap-6">
            <Link href="/login" className="text-sm font-semibold leading-6 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-500 hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-16">
        
        {/* ---------------- 1. HERO SECTION ---------------- */}
        <section className="relative overflow-hidden px-6 lg:px-8 pb-20 pt-16">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-center"
              >
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20">
                  AI-Powered CRM Automation
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white"
              >
                Stop losing leads in your inbox.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-medium text-zinc-700 dark:text-zinc-300 mb-6"
              >
                Turn every customer conversation into an actionable sales pipeline.
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                LeadLoop AI captures incoming enquiries, understands customer intent, updates your CRM, qualifies opportunities, assigns sales reps and creates follow-ups automatically.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  Start for Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/overview" 
                  className="w-full sm:w-auto rounded-full bg-white dark:bg-zinc-900 px-8 py-4 text-base font-semibold text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
                >
                  See LeadLoop in Action
                </Link>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-500"
              >
                AI-powered • Human-supervised • Fully observable
              </motion.p>
            </div>
          </div>
        </section>

        {/* ---------------- 2. HERO VISUAL DEMO ---------------- */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-32">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 sm:p-8 lg:p-12 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-zinc-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,1),rgba(0,0,0,0.4))]"></div>
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
              
              {/* LEFT - Email */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/3 flex flex-col gap-2"
              >
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <Mail className="h-4 w-4" /> New Enquiry
                  </div>
                  <div className="space-y-1 mb-4 text-sm">
                    <p><span className="font-medium text-zinc-900 dark:text-zinc-100">From:</span> David Okafor</p>
                    <p><span className="font-medium text-zinc-900 dark:text-zinc-100">Company:</span> Sunrise Guesthouse</p>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    "We're looking to install solar for our 20-room guesthouse in Lekki. Budget is around ₦8m–₦10m and we'd like it completed next month."
                  </p>
                </div>
                <div className="text-center text-xs font-semibold text-zinc-500 flex items-center justify-center gap-1">
                  Source: Gmail
                </div>
              </motion.div>

              {/* ARROW 1 */}
              <div className="hidden lg:flex items-center text-zinc-300 dark:text-zinc-700">
                <ArrowRight className="h-8 w-8" />
              </div>
              <div className="flex lg:hidden items-center text-zinc-300 dark:text-zinc-700">
                <ArrowDown className="h-8 w-8" />
              </div>

              {/* CENTER - LeadLoop AI */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/3"
              >
                <div className="rounded-xl border-2 border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-500/20 p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  <div className="flex items-center justify-center gap-2 font-bold text-lg mb-6 text-blue-900 dark:text-blue-100">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    LeadLoop AI
                  </div>
                  <div className="space-y-3">
                    {[
                      "Contact extracted",
                      "Opportunity identified",
                      "Purchase intent detected",
                      "Budget understood",
                      "Lead qualified",
                      "Follow-up recommended"
                    ].map((step, i) => (
                      <motion.div 
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.15) }}
                        className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ARROW 2 */}
              <div className="hidden lg:flex items-center text-zinc-300 dark:text-zinc-700">
                <ArrowRight className="h-8 w-8" />
              </div>
              <div className="flex lg:hidden items-center text-zinc-300 dark:text-zinc-700">
                <ArrowDown className="h-8 w-8" />
              </div>

              {/* RIGHT - CRM Result */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
                className="w-full lg:w-1/3 flex flex-col gap-2"
              >
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-xl relative">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-tight">David Okafor</h3>
                      <p className="text-sm text-zinc-500">Sunrise Guesthouse</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                      🔥 HOT
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-0.5">Score</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">91 / 100</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-0.5">Budget</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">₦8m–₦10m</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm border-t border-zinc-100 dark:border-zinc-800 pt-3 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Service:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">Solar Installation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Location:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">Lekki</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Timeline:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-right">Next month</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Next Action</span>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">Assigned to Sarah</span>
                    </div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Call tomorrow afternoon</p>
                  </div>
                </div>
                
                <div className="text-center text-xs font-bold text-green-600 dark:text-green-500 flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/20 py-1.5 px-3 rounded-full mx-auto w-fit border border-green-200 dark:border-green-800/50">
                  <CheckCircle2 className="h-3 w-3" /> CRM Updated
                </div>
              </motion.div>
            </div>
            
            <div className="mt-12 text-center text-sm font-bold tracking-widest text-zinc-400 uppercase">
              Email &rarr; LeadLoop AI &rarr; CRM
            </div>
          </div>
        </section>

        {/* ---------------- 3. PROBLEM SECTION ---------------- */}
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-4">
                Your leads are already talking.<br className="hidden sm:block" /> Your CRM just isn't listening.
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Customer information arrives through emails, forms and conversations, but sales teams still spend valuable time manually copying that information into CRM systems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Leads Get Buried', desc: 'Important enquiries disappear inside busy inboxes.', icon: Inbox },
                { title: 'CRM Records Go Stale', desc: 'Customer information doesn\'t always make it into the CRM.', icon: Database },
                { title: 'Follow-Ups Get Missed', desc: 'High-value opportunities can go cold because nobody created the next action.', icon: Clock },
              ].map((prob, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm text-center">
                  <div className="mx-auto h-12 w-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                    <prob.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{prob.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{prob.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <span className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-md text-lg">
                LeadLoop closes the gap between conversation and action.
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- 4. FEATURES SECTION (IMPROVED) ---------------- */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold leading-7 text-blue-600 tracking-wide uppercase">Everything you need to scale sales</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Intelligent CRM primitives
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-10 bg-white dark:bg-zinc-900 hover:shadow-xl transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">AI-Powered Extraction</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                  Instantly reads emails and web forms to pull out names, budgets, services, and timelines.
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 text-sm text-zinc-400 line-through decoration-zinc-300 dark:decoration-zinc-700 mb-2">
                  "Hey I need solar, I have 10m..."
                </div>
                <div className="flex justify-center my-2 text-blue-500"><ArrowDown className="h-4 w-4" /></div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800"><span className="text-blue-500">"service":</span> "Solar"</div>
                  <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800"><span className="text-blue-500">"budget":</span> 10000000</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-10 bg-white dark:bg-zinc-900 hover:shadow-xl transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Instant Qualification</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                  Automatically scores leads based on their purchase intent and budget, marking them HOT, WARM, or COLD.
                </p>
              </div>
              <div className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 rounded-xl p-6 border border-zinc-100 dark:border-zinc-800 h-32">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tighter">91<span className="text-zinc-400 text-2xl font-medium">/100</span></div>
                  <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 shadow-sm">
                    🔥 HOT LEAD
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-10 bg-white dark:bg-zinc-900 hover:shadow-xl transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Automated Workflows</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                  Assigns the right sales representative and schedules follow-up tasks without manual intervention.
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <span className="text-sm font-medium text-zinc-500">Assigned &rarr;</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2"><div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs">S</div> Sarah</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <span className="text-sm font-medium text-zinc-500">Follow-up &rarr;</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white text-amber-600 dark:text-amber-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Tomorrow</span>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-10 bg-white dark:bg-zinc-900 hover:shadow-xl transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Observable Pipeline</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                  Watch your leads move through stages on a beautiful Kanban board and track metrics in real-time.
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex gap-2 h-32 overflow-hidden">
                <div className="w-1/3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded flex flex-col p-2 gap-2">
                  <div className="h-2 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                  <div className="bg-white dark:bg-zinc-900 h-10 rounded shadow-sm border border-zinc-200 dark:border-zinc-700"></div>
                </div>
                <div className="w-1/3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded flex flex-col p-2 gap-2">
                  <div className="h-2 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                  <div className="bg-white dark:bg-zinc-900 h-12 rounded shadow-sm border border-blue-500"></div>
                </div>
                <div className="w-1/3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded flex flex-col p-2 gap-2">
                  <div className="h-2 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------- 5. HOW IT WORKS ---------------- */}
        <section className="py-24 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
                From conversation to opportunity. Automatically.
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 -translate-y-1/2"></div>
              
              {[
                { num: '01', title: 'Capture', desc: 'Lead arrives through Gmail or form.' },
                { num: '02', title: 'Understand', desc: 'AI extracts requirements & intent.' },
                { num: '03', title: 'Qualify', desc: 'LeadLoop summarizes and scores.' },
                { num: '04', title: 'Organize', desc: 'Create or update CRM record.' },
                { num: '05', title: 'Act', desc: 'Assign rep & create follow-up.' },
                { num: '06', title: 'Track', desc: 'Record actions for visibility.' },
              ].map((step, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full lg:w-48 text-center shadow-xl relative group hover:border-blue-500 transition-colors">
                  <div className="text-blue-500 font-mono font-bold mb-3">{step.num}</div>
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 6. BEFORE VS AFTER ---------------- */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Your sales workflow, without the busywork.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Before */}
            <div className="border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-3xl p-8 sm:p-12">
              <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-8 border-b border-red-200 dark:border-red-900/50 pb-4">
                BEFORE LEADLOOP
              </h3>
              
              <div className="flex flex-col items-center gap-3 font-medium text-zinc-600 dark:text-zinc-400">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-xl shadow-sm flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Customer enquiry
                </div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Read email</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Copy customer details</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Open CRM</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Create lead</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Write summary</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Qualify opportunity</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Assign salesperson</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Create reminder</div>
                <ArrowDown className="w-4 h-4 text-zinc-300" />
                <div>Send internal message</div>
              </div>

              <div className="mt-12 text-center">
                <span className="inline-block bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  Manual. Repetitive. Easy to miss.
                </span>
              </div>
            </div>

            {/* After */}
            <div className="border-2 border-blue-500 bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-32 h-32 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                WITH LEADLOOP
              </h3>
              
              <div className="flex flex-col items-center gap-4 font-medium relative z-10 h-full">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Mail className="w-5 h-5" /> Customer enquiry
                </div>
                
                <div className="w-0.5 h-12 bg-gradient-to-b from-zinc-200 to-blue-500 dark:from-zinc-800 dark:to-blue-500"></div>
                
                <div className="bg-blue-600 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 font-bold text-lg flex items-center gap-2">
                  <Bot className="w-6 h-6" /> LeadLoop AI
                </div>

                <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 to-green-500"></div>

                <div className="bg-white dark:bg-zinc-950 border-2 border-green-500 px-8 py-4 rounded-xl shadow-xl font-bold text-lg flex flex-col items-center gap-2 w-full max-w-xs">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    🔥 Qualified opportunity
                  </div>
                  <div className="w-full space-y-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 text-left">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> CRM updated</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Lead scored</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Rep assigned</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Follow-up created</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Team notified</div>
                  </div>
                </div>

                <div className="mt-8 text-center pt-4">
                  <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/50">
                    One conversation. One automated workflow.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 7. HUMAN OVERSIGHT ---------------- */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-4">
                AI when it's confident. Humans when it matters.
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                LeadLoop doesn't blindly write AI-generated information into your CRM. Low-confidence enquiries are sent to a Review Queue before automation continues.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* High Confidence */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-green-500/20 shadow-sm relative">
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-mono font-bold text-lg px-3 py-1 rounded-full">
                  95%
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-green-600 dark:text-green-500">High Confidence</h3>
                
                <div className="space-y-4 font-medium">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Automatically processed
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500">CRM Update</span>
                    <span className="text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                       Approved <Check className="w-4 h-4 text-green-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Low Confidence */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-amber-500/50 shadow-lg relative">
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-mono font-bold text-lg px-3 py-1 rounded-full">
                  48%
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-amber-600 dark:text-amber-500">Low Confidence</h3>
                
                <div className="space-y-4 font-medium mb-6">
                  <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    <AlertCircle className="w-5 h-5 shrink-0" /> Human Review Required
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-bold text-red-500 mb-2">Missing fields:</p>
                    <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                      <li>Service</li>
                      <li>Budget</li>
                      <li>Timeline</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors">Review</button>
                  <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold py-2 rounded-lg transition-colors">Approve</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 8. OBSERVABLE AUTOMATION ---------------- */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-6">
                Know exactly what your AI did.
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Every LeadLoop workflow is recorded, giving teams visibility into AI decisions, automated actions, failures and retries. Never wonder why a CRM record was updated again.
              </p>
              <Link href="/automation-runs" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-500">
                View Automation Logs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-zinc-950 rounded-2xl p-6 shadow-2xl border border-zinc-800 font-mono text-sm relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
              <div className="text-zinc-400 mb-6 border-b border-zinc-800 pb-4 flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Automation Run #LL-1042</span>
                <span className="text-xs">2 mins ago</span>
              </div>
              
              <div className="space-y-3">
                {[
                  "Gmail enquiry received",
                  "AI extraction completed",
                  "Input validated",
                  "Duplicate check completed",
                  "CRM record created",
                  "Lead scored — 91/100",
                  "Assigned to Sarah",
                  "Follow-up created",
                  "Notification sent"
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {log}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                <span className="text-zinc-500">Status</span>
                <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded">Completed Successfully</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 9. INTEGRATIONS ---------------- */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-4">
                Connect the tools already running your business.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Gmail', desc: 'Capture incoming customer enquiries.', icon: Mail, status: 'Available', color: 'text-red-500' },
                { name: 'Website Forms', desc: 'Turn website submissions into CRM opportunities.', icon: Globe, status: 'Connected', color: 'text-green-500' },
                { name: 'Telegram', desc: 'Notify sales representatives about new opportunities.', icon: Send, status: 'Integration Ready', color: 'text-sky-500' },
                { name: 'LeadLoop CRM', desc: 'Keep customer records and pipeline activity synchronized.', icon: Database, status: 'Connected', color: 'text-emerald-500' },
              ].map((int, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
                  <div className="mb-4">
                    <int.icon className={`w-8 h-8 ${int.color}`} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{int.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 flex-1">{int.desc}</p>
                  
                  <div>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                      int.status === 'Connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                      'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {int.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 10. PIPELINE PREVIEW ---------------- */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8 overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-4">
              Your pipeline updates while your team sells.
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900 p-6 shadow-2xl overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {['New', 'Qualified', 'Contacted', 'Proposal', 'Won'].map((col, i) => (
                <div key={i} className="w-80 bg-zinc-200/50 dark:bg-zinc-950/50 rounded-xl p-3 flex flex-col gap-3">
                  <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between items-center px-1">
                    {col} <span className="bg-zinc-300 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-full">{i === 1 ? '3' : '1'}</span>
                  </div>
                  
                  {i === 1 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-blue-500 rounded-lg p-4 shadow-md relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-lg"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-900 dark:text-white">Sunrise Guesthouse</h4>
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">🔥 HOT - 91</span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">₦8m–₦10m</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded">Solar</span>
                        <div className="flex items-center gap-1 font-bold text-zinc-600 dark:text-zinc-400">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">S</div> Sarah
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm opacity-60">
                      <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800/50 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                        <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 11. BUSINESS VALUE ---------------- */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-4">
                Less CRM administration. More selling.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Less Manual Entry</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Customer conversations become structured CRM records automatically.</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Faster Follow-Up</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Sales representatives immediately know which opportunities require attention.</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Cleaner Customer Data</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Duplicate detection keeps customer histories organized.</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Better Visibility</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Managers can see leads, follow-ups and automation activity from one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 12. FINAL CTA ---------------- */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              Every conversation could be your next customer.
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Stop letting valuable opportunities disappear inside inboxes and forms. <br className="hidden md:block"/>
              <strong className="text-white">LeadLoop turns conversations into actions automatically.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-full bg-white text-blue-600 px-8 py-4 text-lg font-bold shadow-xl hover:bg-zinc-50 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/overview"
                className="w-full sm:w-auto rounded-full bg-blue-700/50 text-white border border-blue-400/30 px-8 py-4 text-lg font-bold hover:bg-blue-700/80 transition-colors backdrop-blur-sm"
              >
                View Demo
              </Link>
            </div>
            
            <p className="text-sm font-bold tracking-widest uppercase text-blue-200/80">
              Capture. Understand. Qualify. Act.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
