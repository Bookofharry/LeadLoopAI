"use client"

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setIsOpen(false)
    setPrevPathname(pathname)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
            aria-hidden="true" 
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-zinc-950 animate-in slide-in-from-left duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button 
                onClick={() => setIsOpen(false)} 
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none ring-2 ring-white/20 hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <Sidebar className="w-full flex-1" />
          </div>
        </div>
      )}
    </>
  )
}
