"use client"

import React from "react"
import Link from "next/link"
import { AutomationNetwork } from "./AutomationNetwork"
import { ArrowRight } from "lucide-react"

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      
      {/* LEFT: Branding & Automation Background */}
      <div className="relative hidden md:flex md:w-[55%] lg:w-[60%] bg-zinc-950 overflow-hidden flex-col">
        {/* Layer 1: Subtle Gradient Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
        
        {/* Layer 2: Faint dot matrix */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        
        {/* Layer 3-6: Automation Network (SVG, Nodes, Packets, Labels) */}
        <div className="absolute inset-0 w-full h-full">
           <AutomationNetwork />
        </div>

        {/* Branding Overlay */}
        <div className="relative z-10 p-12 lg:p-16 flex flex-col h-full pointer-events-none">
          <Link href="/" className="pointer-events-auto flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-auto w-max">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            LeadLoop<span className="text-blue-500">AI</span>
          </Link>

          <div className="mt-auto max-w-lg pb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Turn conversations into opportunities.
            </h1>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed font-medium">
              AI-powered CRM automation that captures, understands, qualifies and routes every valuable customer enquiry.
            </p>
            
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-blue-400 uppercase">
              Capture <ArrowRight className="w-4 h-4 text-zinc-600" /> 
              Understand <ArrowRight className="w-4 h-4 text-zinc-600" /> 
              Qualify <ArrowRight className="w-4 h-4 text-zinc-600" /> 
              Act
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-zinc-950 relative z-20 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Mobile Branding (hidden on desktop) */}
        <div className="md:hidden flex justify-center mb-8 pt-8">
           <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">{title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          
          {children}
          
        </div>
      </div>

    </div>
  )
}
