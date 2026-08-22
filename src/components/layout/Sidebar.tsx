"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  Inbox, 
  CheckSquare, 
  Activity, 
  GitMerge, 
  Settings,
  Blocks
} from "lucide-react"

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Review Queue', href: '/review-queue', icon: Inbox, badge: 2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Automation Runs', href: '/automation-runs', icon: Activity },
  { name: 'Workflow', href: '/workflow', icon: GitMerge },
  { name: 'Integrations', href: '/integrations', icon: Blocks },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
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
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-50'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50',
                  'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors'
                )}
              >
                <div className="flex items-center">
                  <item.icon
                    className={cn(
                      isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300',
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
                {item.badge ? (
                  <span className="ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
