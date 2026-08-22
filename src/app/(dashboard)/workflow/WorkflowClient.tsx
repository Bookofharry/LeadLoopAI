"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  RotateCcw,
  MessageSquare,
  Globe,
  Mail,
  Cpu,
  FileCheck,
  ShieldCheck,
  Split,
  Search,
  Database,
  UserPlus,
  CalendarCheck,
  Check,
  PauseCircle,
  LucideIcon
} from "lucide-react"

type Scenario = "SUCCESS" | "REVIEW" | "DUPLICATE"
type NodeId =
  | "intake"
  | "ai"
  | "extraction"
  | "validation"
  | "confidence"
  | "duplicate_check"
  | "crm"
  | "assignment"
  | "followup"
  | "completed"
  | "paused"
  | null

// The sequence of nodes for each scenario
const SCENARIOS = {
  SUCCESS: ["intake", "ai", "extraction", "validation", "confidence", "duplicate_check", "crm", "assignment", "followup", "completed"],
  REVIEW: ["intake", "ai", "extraction", "validation", "confidence", "paused"],
  DUPLICATE: ["intake", "ai", "extraction", "validation", "confidence", "duplicate_check", "crm", "completed"]
}

const TIMINGS = {
  nodeDelay: 800, // ms between nodes
}

export default function WorkflowClient() {
  const [scenario, setScenario] = useState<Scenario>("SUCCESS")
  const [activeNodes, setActiveNodes] = useState<NodeId[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const playSequence = (selectedScenario: Scenario = scenario) => {
    // Reset state
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveNodes([])
    setIsPlaying(true)
    setIsFinished(false)
    setScenario(selectedScenario)

    const sequence = SCENARIOS[selectedScenario]
    let step = 0;

    const nextStep = () => {
      if (step < sequence.length) {
        setActiveNodes(prev => [...prev, sequence[step] as NodeId])
        step++
        timerRef.current = setTimeout(nextStep, TIMINGS.nodeDelay)
      } else {
        setIsPlaying(false)
        setIsFinished(true)
      }
    }

    // Start first step slightly delayed for UX
    timerRef.current = setTimeout(nextStep, 300)
  }

  // Auto-play on mount
  useEffect(() => {
    playSequence("SUCCESS")
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleScenarioChange = (s: Scenario) => {
    if (s === scenario && isPlaying) return
    playSequence(s)
  }

  const isNodeActive = (nodeId: NodeId) => activeNodes.includes(nodeId)
  const isNodeCurrent = (nodeId: NodeId) => activeNodes[activeNodes.length - 1] === nodeId

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/20">
      {/* Controls Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => handleScenarioChange("SUCCESS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${scenario === "SUCCESS"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${scenario === "SUCCESS" ? "text-green-500" : ""}`} />
            Successful Lead
          </button>
          <button
            onClick={() => handleScenarioChange("REVIEW")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${scenario === "REVIEW"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
          >
            <AlertTriangle className={`h-4 w-4 ${scenario === "REVIEW" ? "text-amber-500" : ""}`} />
            Human Review
          </button>
          <button
            onClick={() => handleScenarioChange("DUPLICATE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${scenario === "DUPLICATE"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
          >
            <RefreshCw className={`h-4 w-4 ${scenario === "DUPLICATE" ? "text-blue-500" : ""}`} />
            Duplicate Lead
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => playSequence(scenario)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            {isPlaying ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Restart" : "Replay"}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative flex justify-center">

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-16 relative z-10 py-10 items-center lg:items-stretch">

          {/* Column 1: Intake */}
          <div className="flex flex-col justify-center gap-4 w-64 shrink-0">
            <WorkflowNode
              id="intake-manual"
              icon={MessageSquare}
              title="Manual Intake"
              subtitle="Paste email, WhatsApp, SMS, or notes"
              isActive={isNodeActive("intake") && scenario === "REVIEW"}
              isCurrent={isNodeCurrent("intake") && scenario === "REVIEW"}
            />
            <WorkflowNode
              id="intake-webhook"
              icon={Globe}
              title="Website Form"
              subtitle="Secure webhook integration"
              isActive={isNodeActive("intake") && scenario !== "REVIEW"}
              isCurrent={isNodeCurrent("intake") && scenario !== "REVIEW"}
            />
            <WorkflowNode
              id="intake-gmail"
              icon={Mail}
              title="Gmail"
              subtitle="Coming Soon"
              isActive={false}
              isCurrent={false}
              muted
            />
          </div>

          {/* Connectors (CSS based for layout simplicity, SVG for visual) */}
          <div className="hidden lg:flex w-12 shrink-0 relative items-center justify-center">
            {/* The animated path from intake to AI */}
            {isNodeActive("ai") && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                className="h-0.5 bg-blue-500 absolute left-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ top: scenario === "REVIEW" ? "20%" : "50%" }}
              />
            )}
          </div>

          {/* Column 2: Processing Core */}
          <div className="flex flex-col items-center gap-8 w-72 shrink-0">

            {/* LeadLoop AI Node - The Centerpiece */}
            <div className="relative">
              <WorkflowNode
                id="ai"
                icon={Cpu}
                title="LeadLoop AI"
                subtitle="Mistral-powered intelligence"
                isActive={isNodeActive("ai")}
                isCurrent={isNodeCurrent("ai")}
                className={isNodeActive("ai") ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] dark:shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : ""}
                iconColor={isNodeActive("ai") ? "text-blue-500" : ""}
              />
              <AnimatePresence>
                {isNodeCurrent("ai") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded-full shadow-sm"
                  >
                    Understanding conversation...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
              {isNodeActive("extraction") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </div>

            <WorkflowNode
              id="extraction"
              icon={FileCheck}
              title="AI Extraction"
              subtitle={
                scenario === "REVIEW" ? "Missing fields detected" :
                  "Structured fields extracted"
              }
              isActive={isNodeActive("extraction")}
              isCurrent={isNodeCurrent("extraction")}
              content={
                isNodeActive("extraction") ? (
                  <div className="mt-3 text-xs space-y-1 p-2 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                    {scenario === "REVIEW" ? (
                      <>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">Name: Unknown</div>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">Service: Unknown</div>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">Budget: Unknown</div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-zinc-400">Name:</span> David Okafor</div>
                        <div><span className="text-zinc-400">Service:</span> Solar Install</div>
                        <div><span className="text-zinc-400">Budget:</span> ₦8m–₦10m</div>
                      </>
                    )}
                  </div>
                ) : undefined
              }
            />

            <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
              {isNodeActive("validation") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </div>

            <WorkflowNode
              id="validation"
              icon={ShieldCheck}
              title="Validation"
              subtitle="Schema & type checking"
              isActive={isNodeActive("validation")}
              isCurrent={isNodeCurrent("validation")}
            />

            <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
              {isNodeActive("confidence") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </div>

            {/* Confidence Branching */}
            <div className="relative">
              <WorkflowNode
                id="confidence"
                icon={Split}
                title="Confidence Check"
                subtitle={
                  !isNodeActive("confidence") ? "Evaluate AI certainty" :
                    scenario === "SUCCESS" ? "Score: 94%" :
                      scenario === "DUPLICATE" ? "Score: 92%" :
                        "Score: 30%"
                }
                isActive={isNodeActive("confidence")}
                isCurrent={isNodeCurrent("confidence")}
                className={isNodeActive("confidence") && scenario === "REVIEW" ? "border-amber-500" : ""}
                iconColor={isNodeActive("confidence") && scenario === "REVIEW" ? "text-amber-500" : ""}
              />
            </div>
          </div>

          <div className="hidden lg:flex w-12 shrink-0 relative items-center justify-center">
            {isNodeActive("paused") && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                className="h-0.5 bg-amber-500 absolute left-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ top: "85%" }}
              />
            )}
            {isNodeActive("duplicate_check") && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                className="h-0.5 bg-blue-500 absolute left-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ top: "85%" }} // approximate line up
              />
            )}
          </div>

          {/* Column 3: Outputs & Decisions */}
          <div className="flex flex-col items-center gap-8 w-72 shrink-0 justify-end h-full">

            {scenario === "REVIEW" ? (
              <AnimatePresence>
                {isNodeActive("paused") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="w-full mt-auto"
                  >
                    <WorkflowNode
                      id="paused"
                      icon={PauseCircle}
                      title="Human Review"
                      subtitle="Automation safely paused"
                      isActive={true}
                      isCurrent={true}
                      className="border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      iconColor="text-amber-500"
                      content={
                        <div className="mt-3 text-xs p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-800 dark:text-amber-200">
                          <strong>Awaiting Human Action:</strong>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-white dark:bg-zinc-800 rounded shadow-sm">Correct</span>
                            <span className="px-2 py-1 bg-zinc-900 text-white rounded shadow-sm">Approve</span>
                          </div>
                        </div>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <>
                <WorkflowNode
                  id="duplicate_check"
                  icon={Search}
                  title="Duplicate Detection"
                  subtitle={
                    !isNodeActive("duplicate_check") ? "Verify email & phone" :
                      scenario === "DUPLICATE" ? "Existing Lead Found" :
                        "No Existing Match"
                  }
                  isActive={isNodeActive("duplicate_check")}
                  isCurrent={isNodeCurrent("duplicate_check")}
                />

                <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
                  {isNodeActive("crm") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                </div>

                <WorkflowNode
                  id="crm"
                  icon={Database}
                  title={scenario === "DUPLICATE" ? "Existing Lead Updated" : "CRM Lead Created"}
                  subtitle={scenario === "DUPLICATE" ? "Interaction appended" : "David Okafor inserted"}
                  isActive={isNodeActive("crm")}
                  isCurrent={isNodeCurrent("crm")}
                  content={
                    isNodeActive("crm") ? (
                      <div className="mt-3 flex items-center justify-between text-xs p-2 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800">
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">David Okafor</div>
                          <div className="text-zinc-500">Sunrise Guesthouse</div>
                        </div>
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-[10px] font-bold">HOT</span>
                      </div>
                    ) : undefined
                  }
                />

                {scenario === "SUCCESS" && (
                  <>
                    <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
                      {isNodeActive("assignment") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                    </div>

                    <WorkflowNode
                      id="assignment"
                      icon={UserPlus}
                      title="Sales Rep Assignment"
                      subtitle="Rule: Solar → Sarah Johnson"
                      isActive={isNodeActive("assignment")}
                      isCurrent={isNodeCurrent("assignment")}
                    />

                    <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
                      {isNodeActive("followup") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                    </div>

                    <WorkflowNode
                      id="followup"
                      icon={CalendarCheck}
                      title="Follow-Up Task"
                      subtitle="Call David regarding solar"
                      isActive={isNodeActive("followup")}
                      isCurrent={isNodeCurrent("followup")}
                    />
                  </>
                )}

                <div className="h-8 w-0.5 bg-zinc-200 dark:bg-zinc-800 relative">
                  {isNodeActive("completed") && <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} className="w-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                </div>

                <WorkflowNode
                  id="completed"
                  icon={Check}
                  title="Workflow Completed"
                  subtitle="Automation trace logged"
                  isActive={isNodeActive("completed")}
                  isCurrent={isNodeCurrent("completed")}
                  className={isNodeActive("completed") ? "border-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : ""}
                  iconColor={isNodeActive("completed") ? "text-green-500" : ""}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Side Panel Explanation */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Current Step
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 min-h-[40px]">
            {!isPlaying && !isFinished && "Select a scenario and click Play."}
            {isFinished && "Workflow completed."}
            {isPlaying && isNodeCurrent("intake") && "Receiving unstructured customer conversation from intake channel."}
            {isPlaying && isNodeCurrent("ai") && "LeadLoop AI is analyzing the text using Mistral."}
            {isPlaying && isNodeCurrent("extraction") && "Extracting actionable fields (Name, Service, Budget)."}
            {isPlaying && isNodeCurrent("validation") && "Validating extracted data against the CRM schema."}
            {isPlaying && isNodeCurrent("confidence") && "Checking AI confidence score to determine safe routing."}
            {isPlaying && isNodeCurrent("paused") && "Confidence too low. Safely paused for Human Review."}
            {isPlaying && isNodeCurrent("duplicate_check") && "Checking CRM for existing customers by email/phone."}
            {isPlaying && isNodeCurrent("crm") && scenario === "DUPLICATE" ? "Appending interaction to existing customer record." : ""}
            {isPlaying && isNodeCurrent("crm") && scenario === "SUCCESS" ? "Creating new Lead record in Supabase CRM." : ""}
            {isPlaying && isNodeCurrent("assignment") && "Applying deterministic business rules to assign a salesperson."}
            {isPlaying && isNodeCurrent("followup") && "Creating a pending follow-up task for the assigned rep."}
            {isPlaying && isNodeCurrent("completed") && "Workflow successfully finished and logged."}
          </p>
        </div>
      </div>
    </div>
  )
}

function WorkflowNode({
  icon: Icon,
  title,
  subtitle,
  isActive,
  isCurrent,
  content,
  muted = false,
  className = "",
  iconColor = "text-zinc-500"
}: {
  id: string,
  icon: LucideIcon,
  title: string,
  subtitle: string,
  isActive: boolean,
  isCurrent: boolean,
  content?: React.ReactNode,
  muted?: boolean,
  className?: string,
  iconColor?: string
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isCurrent ? 1.05 : 1,
        opacity: muted ? 0.4 : isActive ? 1 : 0.6
      }}
      className={`w-full rounded-xl border bg-white dark:bg-zinc-900 p-4 relative transition-colors duration-500 ${isActive && !className ? "border-zinc-300 dark:border-zinc-700 shadow-sm" : "border-zinc-200 dark:border-zinc-800"
        } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
          <Icon className={`h-5 w-5 ${isActive && !iconColor.includes('text-zinc') ? iconColor : 'text-zinc-500 dark:text-zinc-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'}`}>
            {title}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
      {content}
    </motion.div>
  )
}
