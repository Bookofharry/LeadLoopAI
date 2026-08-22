"use client"

import { useState, useEffect } from "react"
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" })
  
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || "")
        // Supabase stores custom user fields in user_metadata by default
        setFirstName(user.user_metadata?.first_name || "")
        setLastName(user.user_metadata?.last_name || "")
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setStatusMessage({ text: "", type: "" })
    
    // Update the authenticated user's metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (error) {
      setStatusMessage({ text: error.message, type: "error" })
    } else {
      setStatusMessage({ text: "Profile updated successfully!", type: "success" })
    }
    
    setIsSaving(false)
    // Clear success message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ text: "", type: "" })
    }, 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-zinc-500" />
            Settings
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your account and workspace preferences.</p>
        </div>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide">
          <a href="#" className="border-blue-500 text-blue-600 dark:text-blue-400 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium flex items-center gap-2 transition-colors">
            <User className="h-4 w-4" />
            Profile
          </a>
          <a href="#" className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium flex items-center gap-2 transition-colors">
            <Bell className="h-4 w-4" />
            Notifications
          </a>
          <a href="#" className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium flex items-center gap-2 transition-colors">
            <Shield className="h-4 w-4" />
            Security
          </a>
        </nav>
      </div>

      <div className="mt-8 space-y-8">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">Personal Information</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Update your personal details and public profile.
            </p>
          </div>
          
          {isLoading ? (
            <div className="px-6 py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">First name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-800 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Last name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-800 transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 flex justify-between">
                    Email address
                    <span className="text-xs font-normal text-zinc-500">Contact support to change</span>
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    disabled
                    className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-zinc-500 bg-zinc-50 shadow-sm ring-1 ring-inset ring-zinc-200 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 cursor-not-allowed" 
                  />
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/80 px-6 py-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-sm">
                  {statusMessage.text && (
                    <span className={statusMessage.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {statusMessage.text}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
