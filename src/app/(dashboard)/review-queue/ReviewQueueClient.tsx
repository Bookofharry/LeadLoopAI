"use client"

import { useState, useMemo, useEffect } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { MessageSquare, AlertTriangle, User, Building, MapPin, Briefcase, Mail, Phone, Clock, DollarSign, Check, X, Database, ListFilter } from "lucide-react"
import { approveReview, rejectReview } from "./actions"
import { AIQualificationResult } from "@/lib/services/ai"

export default function ReviewQueueClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [selectedReview, setSelectedReview] = useState<any | null>(null)
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending")
  
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => r.status === activeTab)
  }, [reviews, activeTab])

  // Edit State
  const [editData, setEditData] = useState<AIQualificationResult | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const openModal = (review: any) => {
    setSelectedReview(review)
    setEditData({ ...review.extracted_data })
    setShowRejectForm(false)
    setRejectReason("")
  }

  const closeModal = () => {
    setSelectedReview(null)
    setEditData(null)
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReview) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedReview])

  const handleApprove = async () => {
    if (!selectedReview || !editData) return
    setLoading(true)
    try {
      const res = await approveReview(selectedReview.id, editData, selectedReview.interactions.id)
      if (res.success) {
        setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, status: "Approved", extracted_data: editData } : r))
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
      const res = await rejectReview(selectedReview.id, selectedReview.interactions.id, rejectReason)
      if (res.success) {
        setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, status: "Rejected" } : r))
        closeModal()
      } else {
        alert("Failed to reject: " + res.error)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const renderValue = (value: any) => {
    if (!value) return <span className="text-zinc-400 italic">Not detected</span>
    return value
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {tab} ({reviews.filter(r => r.status === tab).length})
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
            <ListFilter className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No {activeTab.toLowerCase()} reviews</h3>
          <p className="mt-1 text-zinc-500 max-w-sm">
            {activeTab === "Pending" ? "There are no pending leads requiring manual human review at this time." : `No ${activeTab.toLowerCase()} items found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredReviews.map((review) => {
            const confidencePercent = ((review.confidence || 0) * 100).toFixed(0);
            return (
              <div key={review.id} className="relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {review.status === "Pending" ? (
                       <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                         <AlertTriangle className="mr-1 h-3 w-3" /> Needs Review
                       </span>
                    ) : review.status === "Approved" ? (
                       <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                         <Check className="mr-1 h-3 w-3" /> Approved
                       </span>
                    ) : (
                       <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                         <X className="mr-1 h-3 w-3" /> Rejected
                       </span>
                    )}
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-2">
                    {review.extracted_data.summary || "Unknown Request"}
                  </h3>
                  
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-4 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <strong>AI CONFIDENCE: {confidencePercent}%</strong>
                    <p className="text-xs opacity-90 mt-0.5">Low confidence — human verification required</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block w-full mb-1">Missing Fields:</span>
                    {review.missing_fields && review.missing_fields.length > 0 ? (
                      review.missing_fields.map((field: string) => (
                        <span key={field} className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/50">
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500 italic">None</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Source: {review.interactions?.source}
                  </div>
                  {review.status === "Pending" ? (
                    <button 
                      onClick={() => openModal(review)}
                      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                      Review & Correct
                    </button>
                  ) : (
                    <div className="text-xs text-zinc-500">
                      Reviewed on {format(new Date(review.reviewed_at), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedReview && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
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
                
                {/* Left Side: Original Message & Context */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Original Enquiry
                    </h4>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 max-h-[300px] overflow-y-auto">
                      {selectedReview.interactions.raw_content}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-2">AI Summary</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400/90">{editData.summary}</p>
                  </div>
                </div>

                {/* Right Side: Editable Form */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                    <Database className="h-4 w-4 text-emerald-500" />
                    Corrected Data
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><User className="h-3 w-3"/> Name</label>
                      <input 
                        type="text" 
                        value={editData.name || ""} 
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="Not detected"
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</label>
                        <input 
                          type="email" 
                          value={editData.email || ""} 
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          placeholder="Not detected"
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Phone className="h-3 w-3"/> Phone</label>
                        <input 
                          type="text" 
                          value={editData.phone || ""} 
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          placeholder="Not detected"
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Building className="h-3 w-3"/> Company</label>
                      <input 
                        type="text" 
                        value={editData.company || ""} 
                        onChange={(e) => setEditData({...editData, company: e.target.value})}
                        placeholder="Not detected"
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3"/> Service Requested</label>
                      <input 
                        type="text" 
                        value={editData.service || ""} 
                        onChange={(e) => setEditData({...editData, service: e.target.value})}
                        placeholder="Not detected"
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3"/> Min Budget</label>
                        <input 
                          type="number" 
                          value={editData.budget_min || ""} 
                          onChange={(e) => setEditData({...editData, budget_min: Number(e.target.value) || null})}
                          placeholder="Not detected"
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3"/> Max Budget</label>
                        <input 
                          type="number" 
                          value={editData.budget_max || ""} 
                          onChange={(e) => setEditData({...editData, budget_max: Number(e.target.value) || null})}
                          placeholder="Not detected"
                          className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Timeline</label>
                      <input 
                        type="text" 
                        value={editData.timeline || ""} 
                        onChange={(e) => setEditData({...editData, timeline: e.target.value})}
                        placeholder="Not detected"
                        className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-blue-500 placeholder:text-zinc-400 placeholder:italic" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between items-center">
              
              {showRejectForm ? (
                <div className="flex flex-1 items-center gap-3 pr-4 animate-in fade-in slide-in-from-left-4">
                  <input
                    type="text"
                    placeholder="Reason for rejection (e.g. Spam, Not a lead)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 rounded-md border-red-300 dark:border-red-900/50 bg-white dark:bg-zinc-900 text-sm focus:ring-red-500"
                    autoFocus
                  />
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    disabled={loading}
                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                >
                  Reject Item
                </button>
              )}

              {!showRejectForm && (
                <div className="flex gap-3 ml-auto">
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
                    {loading ? "Processing..." : "Approve & Continue"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
