"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, AlertTriangle, User, Building, MapPin, Briefcase, Mail, Phone, Clock, DollarSign, Check, X, Database } from "lucide-react"
import { approveReview, rejectReview } from "./actions"
import { AIQualificationResult } from "@/lib/services/ai"

export default function ReviewQueueClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  
  // Edit State
  const [editData, setEditData] = useState<AIQualificationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const openModal = (review: any) => {
    setSelectedReview(review)
    setEditData({ ...review.extracted_data })
  }

  const closeModal = () => {
    setSelectedReview(null)
    setEditData(null)
  }

  const handleApprove = async () => {
    if (!selectedReview || !editData) return
    setLoading(true)
    try {
      const res = await approveReview(selectedReview.id, editData, selectedReview.interactions.id)
      if (res.success) {
        setReviews(reviews.filter(r => r.id !== selectedReview.id))
        closeModal()
      } else {
        alert("Failed to approve: " + res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReview) return
    setLoading(true)
    try {
      const res = await rejectReview(selectedReview.id, selectedReview.interactions.id)
      if (res.success) {
        setReviews(reviews.filter(r => r.id !== selectedReview.id))
        closeModal()
      } else {
        alert("Failed to reject: " + res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">All Caught Up!</h3>
        <p className="mt-1 text-zinc-500 max-w-sm">There are no pending leads requiring manual human review at this time.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Needs Review
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                {review.extracted_data.summary || "Unknown Request"}
              </h3>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block w-full mb-1">Missing Fields:</span>
                {review.missing_fields.map((field: string) => (
                  <span key={field} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/50">
                    {field}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                Confidence: {((review.confidence || 0) * 100).toFixed(0)}%
              </div>
              <button 
                onClick={() => openModal(review)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Review Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReview && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Review & Correct Extraction
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Original Message */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Original Message
                  </h4>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 min-h-[300px]">
                    {selectedReview.interactions.raw_content}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block w-full">AI Flagged Missing:</span>
                    {selectedReview.missing_fields.map((field: string) => (
                      <span key={field} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/50">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Editable Form */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" />
                    Corrected Data
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><User className="h-3 w-3"/> Name</label>
                      <input 
                        type="text" 
                        value={editData.name || ""} 
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</label>
                        <input 
                          type="email" 
                          value={editData.email || ""} 
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Phone className="h-3 w-3"/> Phone</label>
                        <input 
                          type="text" 
                          value={editData.phone || ""} 
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Building className="h-3 w-3"/> Company</label>
                      <input 
                        type="text" 
                        value={editData.company || ""} 
                        onChange={(e) => setEditData({...editData, company: e.target.value})}
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3"/> Service Requested</label>
                      <input 
                        type="text" 
                        value={editData.service || ""} 
                        onChange={(e) => setEditData({...editData, service: e.target.value})}
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Timeline</label>
                      <input 
                        type="text" 
                        value={editData.timeline || ""} 
                        onChange={(e) => setEditData({...editData, timeline: e.target.value})}
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between">
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
              >
                Reject & Discard
              </button>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {loading ? "Approving..." : "Approve to CRM"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
