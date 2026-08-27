"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  PauseCircle,
  LucideIcon
} from "lucide-react"

type Scenario = "SUCCESS" | "REVIEW" | "REVIEW_APPROVED" | "DUPLICATE"
type NodeId = string

const SCENARIOS = {
  SUCCESS: ["intake-web", "ai", "extraction", "validation", "confidence", "duplicate_check", "crm", "assignment", "followup", "completed"],
  REVIEW: ["intake-manual", "ai", "extraction", "validation", "confidence", "review"],
  REVIEW_APPROVED: ["intake-manual", "ai", "extraction", "validation", "confidence", "review", "crm", "assignment", "followup", "completed"],
  DUPLICATE: ["intake-web", "ai", "extraction", "validation", "confidence", "duplicate_check", "crm", "completed"]
}

const TIMINGS = {
  nodeDelay: 800,
}

const ALL_EDGES = [
  ['intake-web', 'ai'],
  ['intake-manual', 'ai'],
  ['intake-gmail', 'ai'],
  ['ai', 'extraction'],
  ['extraction', 'validation'],
  ['validation', 'confidence'],
  ['confidence', 'duplicate_check'],
  ['confidence', 'review'],
  ['duplicate_check', 'crm'],
  ['review', 'crm'], // Resume flow edge
  ['crm', 'assignment'],
  ['assignment', 'followup'],
  ['followup', 'completed'],
  ['crm', 'completed'], // DUPLICATE scenario short-circuit
]

type NodeDef = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  muted?: boolean;
  isAnchor?: boolean;
  isWarning?: boolean;
  isSuccess?: boolean;
}

const NODE_DEF: Record<string, NodeDef> = {
  'intake-manual': { icon: MessageSquare, title: "Manual Intake" },
  'intake-web': { icon: Globe, title: "Website Form" },
  'intake-gmail': { icon: Mail, title: "Gmail", muted: true },
  
  'ai': { icon: Cpu, title: "AI Agent", subtitle: "Automated intelligence", isAnchor: true },
  'extraction': { icon: FileCheck, title: "Extract" },
  'validation': { icon: ShieldCheck, title: "Validate" },
  
  'confidence': { icon: Split, title: "Confidence" },
  'review': { icon: PauseCircle, title: "Human Review", subtitle: "Paused", isWarning: true },
  
  'duplicate_check': { icon: Search, title: "Duplicate Check" },
  'crm': { icon: Database, title: "CRM Sync" },
  'assignment': { icon: UserPlus, title: "Assign Rep" },
  'followup': { icon: CalendarCheck, title: "Follow-up Task" },
  'completed': { icon: CheckCircle2, title: "Done", isSuccess: true },
}

const WHAT_HAPPENS: Record<string, string> = {
  'intake-web': "Receiving webhook payload from a submitted website form.",
  'intake-manual': "User pasted unstructured customer notes into the dashboard.",
  'ai': "LeadLoop AI analyzes the unstructured text to detect intents and identify required fields.",
  'extraction': "Extracting actionable fields like Name, Requested Service, and Estimated Budget.",
  'validation': "Validating extracted data against required CRM schema fields.",
  'confidence': "Calculating AI confidence score to determine if human review is needed before executing.",
  'review': "Confidence below threshold. Automation paused securely awaiting human confirmation.",
  'duplicate_check': "Checking CRM database against extracted email/phone for existing client records.",
  'crm': "Updating CRM database. Interaction appended to existing lead, or new record created.",
  'assignment': "Deterministic rules engine applies routing (e.g., Solar inquiries assign to Sarah).",
  'followup': "Creating a pending task assigned to the rep to guarantee follow-up.",
  'completed': "Workflow sequence successfully completed and trace logged.",
}

export default function WorkflowClient() {
  const [scenario, setScenario] = useState<Scenario>("SUCCESS")
  const [activeNodes, setActiveNodes] = useState<NodeId[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Layout Measurement State
  const [paths, setPaths] = useState<Record<string, string>>({})
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    nodeRefs.current[id] = el
  }

  const calculatePaths = useCallback(() => {
    if (!canvasRef.current) return {}
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const p: Record<string, string> = {}
    
    ALL_EDGES.forEach(([startId, endId]) => {
      const el1 = nodeRefs.current[startId]
      const el2 = nodeRefs.current[endId]
      if (!el1 || !el2) return

      const r1 = el1.getBoundingClientRect()
      const r2 = el2.getBoundingClientRect()
      
      const c1 = { x: r1.x - canvasRect.x + r1.width/2, y: r1.y - canvasRect.y + r1.height/2 }
      const c2 = { x: r2.x - canvasRect.x + r2.width/2, y: r2.y - canvasRect.y + r2.height/2 }
      
      const isHorizontal = Math.abs(c2.x - c1.x) > Math.abs(c2.y - c1.y)
      
      if (isHorizontal) {
         const start = { x: r1.right - canvasRect.x, y: c1.y }
         const end = { x: r2.left - canvasRect.x, y: c2.y }
         
         if (end.x < start.x) {
           p[`${startId}_to_${endId}`] = `M ${start.x} ${start.y} C ${start.x + 40} ${start.y}, ${end.x - 40} ${end.y}, ${end.x} ${end.y}`
         } else {
           const dx = end.x - start.x
           p[`${startId}_to_${endId}`] = `M ${start.x} ${start.y} C ${start.x + dx * 0.45} ${start.y}, ${end.x - dx * 0.45} ${end.y}, ${end.x} ${end.y}`
         }
      } else {
         const start = { x: c1.x, y: c1.y < c2.y ? r1.bottom - canvasRect.y : r1.top - canvasRect.y }
         const end = { x: c2.x, y: c1.y < c2.y ? r2.top - canvasRect.y : r2.bottom - canvasRect.y }
         
         const dy = end.y - start.y
         p[`${startId}_to_${endId}`] = `M ${start.x} ${start.y} C ${start.x} ${start.y + dy * 0.45}, ${end.x} ${end.y - dy * 0.45}, ${end.x} ${end.y}`
      }
    })
    
    return p
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    let frameId: number
    
    const updatePaths = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        setPaths(calculatePaths())
      })
    }

    const observer = new ResizeObserver(updatePaths)
    observer.observe(canvasRef.current)
    window.addEventListener('resize', updatePaths)
    updatePaths()
    
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePaths)
      cancelAnimationFrame(frameId)
    }
  }, [calculatePaths, scenario])

  const playSequence = (selectedScenario: Scenario = scenario) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveNodes([])
    setIsPlaying(true)
    setIsFinished(false)
    setScenario(selectedScenario)

    const sequence = SCENARIOS[selectedScenario]
    let step = 0;

    const nextStep = () => {
      if (step < sequence.length) {
        setActiveNodes(prev => [...prev, sequence[step]])
        step++
        timerRef.current = setTimeout(nextStep, TIMINGS.nodeDelay)
      } else {
        setIsPlaying(false)
        setIsFinished(true)
      }
    }

    timerRef.current = setTimeout(nextStep, 300)
  }

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
  
  const activePaths = activeNodes.slice(1).map((node, i) => `${activeNodes[i]}_to_${node}`);
  
  const currentNode = activeNodes[activeNodes.length - 1]
  const currentDetails = isPlaying && currentNode ? WHAT_HAPPENS[currentNode] : (isFinished ? "Workflow execution finalized." : "Select a scenario and click Play.")

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/20 font-sans">
      
      {/* Scenario Controls (Compact Segmented) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 shrink-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => handleScenarioChange("SUCCESS")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${scenario === "SUCCESS" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${scenario === "SUCCESS" ? "bg-green-500" : "bg-transparent"}`}></span>
            Successful Lead
          </button>
          <button
            onClick={() => handleScenarioChange("REVIEW")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${scenario === "REVIEW" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"}`}
          >
             <span className={`h-2 w-2 shrink-0 rounded-full ${scenario === "REVIEW" ? "bg-amber-500" : "bg-transparent"}`}></span>
            Human Review (Paused)
          </button>
          <button
            onClick={() => handleScenarioChange("REVIEW_APPROVED")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${scenario === "REVIEW_APPROVED" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"}`}
          >
             <span className={`h-2 w-2 shrink-0 rounded-full ${scenario === "REVIEW_APPROVED" ? "bg-emerald-500" : "bg-transparent"}`}></span>
            Human Review (Resumed)
          </button>
          <button
            onClick={() => handleScenarioChange("DUPLICATE")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${scenario === "DUPLICATE" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"}`}
          >
             <span className={`h-2 w-2 shrink-0 rounded-full ${scenario === "DUPLICATE" ? "bg-blue-500" : "bg-transparent"}`}></span>
            Duplicate Lead
          </button>
        </div>

        <button
          onClick={() => playSequence(scenario)}
          className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          {isPlaying ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isPlaying ? "Restart" : "Play"}
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-x-hidden relative flex flex-col justify-center min-h-[400px]">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
        
        {/* Mobile Layout (Vertical Timeline) */}
        <div className="md:hidden flex flex-col p-6 max-w-sm mx-auto relative z-10 w-full">
           {SCENARIOS[scenario].map((nodeId, idx) => {
             const def = NODE_DEF[nodeId];
             return (
               <div key={nodeId}>
                 <MobileNode 
                   def={def} 
                   isActive={isNodeActive(nodeId)} 
                   isCurrent={isNodeCurrent(nodeId)} 
                 />
                 {idx < SCENARIOS[scenario].length - 1 && (
                   <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-auto my-1"></div>
                 )}
               </div>
             )
           })}
        </div>

        {/* Desktop Layout (Fluid Grid SVG) */}
        <div className="hidden md:flex flex-1 relative w-full px-4 lg:px-8 overflow-hidden items-center justify-center">
          <div ref={canvasRef} className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
            
            {/* Dynamic SVG Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                  <stop offset="50%" stopColor="rgba(59,130,246,0.8)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,1)" />
                </linearGradient>
              </defs>
              
              {Object.entries(paths).map(([pathId, d]) => {
                const isActive = activePaths.includes(pathId);
                return (
                  <g key={pathId}>
                    {/* Base muted path */}
                    <path d={d} fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/70" strokeWidth="1.5" />
                    
                    {/* Highlight path (active steps) */}
                    {isActive && (
                      <path d={d} fill="none" stroke="currentColor" className="text-blue-500/20 dark:text-blue-500/30" strokeWidth="2.5" />
                    )}

                    {/* Packet Animation */}
                    {isActive && (
                       <motion.path
                         d={d}
                         fill="none"
                         stroke="url(#glow)"
                         strokeWidth="3"
                         strokeLinecap="round"
                         strokeDasharray="10 1000"
                         initial={{ pathLength: 0, pathOffset: 1 }}
                         animate={{ pathLength: 0.01, pathOffset: 0 }}
                         transition={{ duration: 0.6, ease: "easeInOut" }}
                       />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Fluid Grid Zones */}
            <div className="relative z-10 w-full grid grid-cols-2 lg:grid-cols-4 grid-rows-2 lg:grid-rows-1 grid-flow-col lg:grid-flow-row gap-6 lg:gap-8 xl:gap-12 items-stretch py-12">
              
              {/* Zone 1: Intake */}
              <div className="flex flex-col gap-6 justify-center">
                <h5 className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase text-center mb-1">01 Intake</h5>
                <ArchitectureNode id="intake-manual" def={NODE_DEF['intake-manual']} isActive={isNodeActive('intake-manual')} isCurrent={isNodeCurrent('intake-manual')} isMuted={NODE_DEF['intake-manual'].muted || !SCENARIOS[scenario].includes('intake-manual')} setRef={setNodeRef} />
                <ArchitectureNode id="intake-web" def={NODE_DEF['intake-web']} isActive={isNodeActive('intake-web')} isCurrent={isNodeCurrent('intake-web')} isMuted={!SCENARIOS[scenario].includes('intake-web')} setRef={setNodeRef} />
                <ArchitectureNode id="intake-gmail" def={NODE_DEF['intake-gmail']} isActive={isNodeActive('intake-gmail')} isCurrent={isNodeCurrent('intake-gmail')} isMuted={true} setRef={setNodeRef} />
              </div>

              {/* Zone 2: Intelligence */}
              <div className="flex flex-col gap-6 justify-center">
                <h5 className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase text-center mb-1">02 Intelligence</h5>
                <ArchitectureNode id="ai" def={NODE_DEF['ai']} isActive={isNodeActive('ai')} isCurrent={isNodeCurrent('ai')} setRef={setNodeRef} />
                <ArchitectureNode id="extraction" def={NODE_DEF['extraction']} isActive={isNodeActive('extraction')} isCurrent={isNodeCurrent('extraction')} setRef={setNodeRef} customLabel={scenario === 'REVIEW' ? "Conversation → ?" : "Conversation → CRM"} />
                <ArchitectureNode id="validation" def={NODE_DEF['validation']} isActive={isNodeActive('validation')} isCurrent={isNodeCurrent('validation')} setRef={setNodeRef} customLabel="Schema + Types" />
              </div>

              {/* Zone 3: Decision */}
              <div className="flex flex-col gap-6 justify-center">
                <h5 className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase text-center mb-1">03 Decision</h5>
                <ArchitectureNode id="confidence" def={NODE_DEF['confidence']} isActive={isNodeActive('confidence')} isCurrent={isNodeCurrent('confidence')} setRef={setNodeRef} customLabel={scenario === "SUCCESS" ? "94%" : scenario === "DUPLICATE" ? "92%" : "30%"} />
                <ArchitectureNode id="review" def={NODE_DEF['review']} isActive={isNodeActive('review')} isCurrent={isNodeCurrent('review')} setRef={setNodeRef} />
              </div>

              {/* Zone 4: Action */}
              <div className="flex flex-col gap-4 justify-center">
                <h5 className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase text-center mb-1">04 Action</h5>
                <ArchitectureNode id="duplicate_check" def={NODE_DEF['duplicate_check']} isActive={isNodeActive('duplicate_check')} isCurrent={isNodeCurrent('duplicate_check')} setRef={setNodeRef} />
                <ArchitectureNode id="crm" def={NODE_DEF['crm']} isActive={isNodeActive('crm')} isCurrent={isNodeCurrent('crm')} setRef={setNodeRef} customLabel={scenario === "DUPLICATE" ? "Append interaction" : "Insert new lead"} />
                <ArchitectureNode id="assignment" def={NODE_DEF['assignment']} isActive={isNodeActive('assignment')} isCurrent={isNodeCurrent('assignment')} setRef={setNodeRef} />
                <ArchitectureNode id="followup" def={NODE_DEF['followup']} isActive={isNodeActive('followup')} isCurrent={isNodeCurrent('followup')} setRef={setNodeRef} />
                <ArchitectureNode id="completed" def={NODE_DEF['completed']} isActive={isNodeActive('completed')} isCurrent={isNodeCurrent('completed')} setRef={setNodeRef} />
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Panel */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0 z-20 flex justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 text-center border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center items-center h-[72px]">
           <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">What's Happening</h4>
           <p className="text-[13px] text-zinc-700 dark:text-zinc-300 font-medium h-5 flex items-center justify-center">
             {currentDetails}
           </p>
        </div>
      </div>
    </div>
  )
}

function ArchitectureNode({ id, def, isActive, isCurrent, isMuted, customLabel, setRef }: any) {
  const Icon = def.icon;
  return (
    <div
      ref={setRef(id)}
      className={`w-full max-w-[180px] mx-auto flex flex-col justify-center relative p-3 rounded-xl border bg-white dark:bg-zinc-900 transition-all duration-300 ${
        isActive 
          ? def.isWarning 
             ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.12)] ring-1 ring-amber-400/30" 
             : def.isAnchor
                ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30"
                : def.isSuccess
                   ? "border-green-500"
                   : "border-zinc-300 dark:border-zinc-600 shadow-sm ring-1 ring-zinc-300/30 dark:ring-zinc-600/30" 
          : "border-zinc-200 dark:border-zinc-800 opacity-60 grayscale-[50%]"
      } ${isMuted ? "opacity-25 grayscale" : ""}`}
    >
       <div className="flex items-center">
         <motion.div 
           animate={{ scale: isCurrent ? 1.15 : 1 }}
           className={`p-1.5 rounded-lg mr-2.5 shrink-0 transition-colors ${
              isActive 
                ? def.isWarning ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' :
                  def.isAnchor ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' :
                  def.isSuccess ? 'bg-green-100 dark:bg-green-900/40 text-green-600' :
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
           }`}
         >
           <Icon className="h-4 w-4" />
         </motion.div>
         <div className="flex-1 min-w-0">
            <div className={`text-[12px] font-semibold truncate transition-colors ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
              {def.title}
            </div>
            {(def.subtitle || customLabel) && (
              <div className={`text-[10px] truncate mt-0.5 transition-colors ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {customLabel || def.subtitle}
              </div>
            )}
         </div>
       </div>
       
       {def.isAnchor && isActive && (
         <span className="absolute -top-1 -right-1 flex h-3 w-3">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
         </span>
       )}
    </div>
  )
}

function MobileNode({ def, isActive, isCurrent }: any) {
  const Icon = def.icon;
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isCurrent ? 1.02 : 1,
        opacity: isActive ? 1 : 0.4
      }}
      className={`flex items-center p-3 rounded-lg border bg-white dark:bg-zinc-900 transition-colors ${
        isActive 
          ? def.isWarning ? "border-amber-400" : def.isAnchor ? "border-blue-500" : def.isSuccess ? "border-green-500" : "border-zinc-300 dark:border-zinc-600 shadow-sm"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
       <div className={`p-2 rounded-lg mr-3 shrink-0 ${
          isActive 
            ? def.isWarning ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' :
              def.isAnchor ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' :
              def.isSuccess ? 'bg-green-100 dark:bg-green-900/40 text-green-600' :
              'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
       }`}>
         <Icon className="h-4 w-4" />
       </div>
       <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold truncate ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
            {def.title}
          </div>
          {def.subtitle && (
            <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
              {def.subtitle}
            </div>
          )}
       </div>
    </motion.div>
  )
}
