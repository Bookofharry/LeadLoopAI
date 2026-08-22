"use client"

import { useToastStore } from "@/lib/store/toast"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-lg p-4 flex gap-3 pointer-events-auto"
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type || 'info']}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {toast.title}
              </h3>
              {toast.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-zinc-400 hover:text-zinc-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
