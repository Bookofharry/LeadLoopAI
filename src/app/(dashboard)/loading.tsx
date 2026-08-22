import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full h-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-800/50 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-zinc-400 dark:text-zinc-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium animate-pulse">Loading data...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
