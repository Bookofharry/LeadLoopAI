import { getPendingReviews } from "./actions"
import ReviewQueueClient from "./ReviewQueueClient"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReviewQueuePage() {
  const { success, data, error } = await getPendingReviews()

  if (!success) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl">
        Failed to load review queue: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Review Queue
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manually review and correct low-confidence AI extractions before they enter your CRM.
          </p>
        </div>
        <div className="text-sm font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
          {data?.length || 0} Pending
        </div>
      </div>

      <ReviewQueueClient initialReviews={data || []} />
    </div>
  )
}
