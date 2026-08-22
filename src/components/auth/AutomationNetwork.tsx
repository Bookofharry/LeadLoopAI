"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Globe, Bot, Database, User, CalendarClock, CheckCircle2 } from "lucide-react"

// Coordinate map for a 800x800 viewBox
const nodes = {
  email: { x: 150, y: 200, icon: Mail, label: "Email" },
  website: { x: 150, y: 600, icon: Globe, label: "Website" },
  ai: { x: 400, y: 400, icon: Bot, label: "LeadLoop AI" },
  crm: { x: 650, y: 200, icon: Database, label: "CRM" },
  rep: { x: 650, y: 400, icon: User, label: "Sales Rep" },
  task: { x: 650, y: 600, icon: CalendarClock, label: "Follow-Up" },
}

// Generate bezier paths between nodes
function createPath(start: {x: number, y: number}, end: {x: number, y: number}) {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
}

const paths = [
  { id: 'email-ai', d: createPath(nodes.email, nodes.ai) },
  { id: 'web-ai', d: createPath(nodes.website, nodes.ai) },
  { id: 'ai-crm', d: createPath(nodes.ai, nodes.crm) },
  { id: 'ai-rep', d: createPath(nodes.ai, nodes.rep) },
  { id: 'ai-task', d: createPath(nodes.ai, nodes.task) },
]

export function AutomationNetwork() {
  const [activeSequence, setActiveSequence] = useState<'idle' | 'email' | 'web'>('idle')
  const [stage, setStage] = useState(0) // 0: idle, 1: input moving, 2: processing, 3: output moving, 4: complete

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const triggerSequence = () => {
      const isEmail = Math.random() > 0.5;
      setActiveSequence(isEmail ? 'email' : 'web')
      setStage(1) // Start input animation

      // Move to processing
      setTimeout(() => setStage(2), 1500)
      
      // Move to outputs
      setTimeout(() => setStage(3), 3000)

      // Complete
      setTimeout(() => setStage(4), 4500)

      // Reset
      setTimeout(() => {
        setStage(0)
        setActiveSequence('idle')
      }, 6500)
    }

    // Initial delay then loop
    const initialDelay = setTimeout(() => {
      triggerSequence();
      interval = setInterval(triggerSequence, 8000)
    }, 1000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
      <svg viewBox="0 0 800 800" className="w-full h-full max-w-[800px] max-h-[800px] opacity-80">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Base Paths */}
        {paths.map(p => (
          <path key={p.id} d={p.d} fill="none" stroke="url(#pathGradient)" strokeWidth="2" />
        ))}

        {/* Animated Input Packets */}
        <AnimatePresence>
          {stage === 1 && (
            <motion.circle
              r="4"
              fill="#60a5fa"
              filter="url(#glow)"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ offsetPath: `path('${activeSequence === 'email' ? paths[0].d : paths[1].d}')` } as any}
            />
          )}
        </AnimatePresence>

        {/* Animated Output Packets */}
        <AnimatePresence>
          {stage === 3 && (
            <>
              <motion.circle r="4" fill="#a78bfa" filter="url(#glow)" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }} style={{ offsetPath: `path('${paths[2].d}')` } as any} />
              <motion.circle r="4" fill="#a78bfa" filter="url(#glow)" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }} style={{ offsetPath: `path('${paths[3].d}')` } as any} />
              <motion.circle r="4" fill="#a78bfa" filter="url(#glow)" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }} style={{ offsetPath: `path('${paths[4].d}')` } as any} />
            </>
          )}
        </AnimatePresence>
      </svg>

      {/* HTML Nodes overlay for better icons/text */}
      <div className="absolute inset-0 w-full h-full max-w-[800px] max-h-[800px] m-auto">
        {Object.entries(nodes).map(([key, node]) => {
          const isAI = key === 'ai'
          const isProcessing = isAI && stage === 2
          const isOutputActive = (key === 'crm' || key === 'rep' || key === 'task') && stage === 4
          const isInputActive = (key === activeSequence) && stage === 1

          return (
            <div 
              key={key} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 800) * 100}%` }}
            >
              <div className="relative">
                {/* Node Glow */}
                <motion.div
                  className={`absolute inset-0 rounded-full blur-xl ${isAI ? 'bg-blue-500' : 'bg-indigo-500'}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isProcessing || isOutputActive || isInputActive ? 0.6 : 0,
                    scale: isProcessing || isOutputActive || isInputActive ? 1.5 : 0.8
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Node Body */}
                <motion.div 
                  className={`relative flex items-center justify-center rounded-2xl border bg-zinc-950/80 backdrop-blur-md shadow-2xl ${
                    isAI ? 'w-16 h-16 border-blue-500/50' : 'w-12 h-12 border-zinc-800'
                  }`}
                  animate={{ 
                    scale: isProcessing || isOutputActive || isInputActive ? 1.1 : 1,
                    borderColor: isProcessing ? 'rgba(59, 130, 246, 0.8)' : isOutputActive ? 'rgba(99, 102, 241, 0.8)' : isAI ? 'rgba(59, 130, 246, 0.5)' : 'rgba(39, 39, 42, 1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <node.icon className={`${isAI ? 'w-8 h-8 text-blue-400' : 'w-5 h-5 text-zinc-400'}`} />
                </motion.div>
                
                {/* Micro Labels */}
                <AnimatePresence>
                  {isInputActive && key === activeSequence && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-blue-400 bg-blue-950/50 px-2 py-1 rounded-md border border-blue-900"
                    >
                      New enquiry
                    </motion.div>
                  )}
                  {isProcessing && key === 'ai' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-blue-400 bg-blue-950/50 px-2 py-1 rounded-md border border-blue-900"
                    >
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span> Extracting & Qualifying</span>
                    </motion.div>
                  )}
                  {isOutputActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-green-400 bg-green-950/50 px-2 py-0.5 rounded-md border border-green-900 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {key === 'crm' ? 'Lead created' : key === 'rep' ? 'Assigned' : 'Task scheduled'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-3 text-sm font-semibold text-zinc-500">{node.label}</div>
            </div>
          )
        })}

        {/* Global Completion Status */}
        <AnimatePresence>
          {stage === 4 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-green-500/5"
            >
              <CheckCircle2 className="w-4 h-4" /> Workflow completed
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
