"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Loader2 } from "lucide-react"
import { signup } from "../actions"

export default function SignupPage() {
  const [errorMsg, setErrorMsg] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg("")
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <AuthLayout 
      title="Start automating your pipeline" 
      subtitle="Create your LeadLoop workspace."
    >
      <form className="space-y-6" onSubmit={handleSignup}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            Full Name
          </label>
          <div className="mt-2">
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800 transition-shadow bg-zinc-50/50" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            Company / Workspace Name
          </label>
          <div className="mt-2">
            <input 
              id="companyName" 
              name="companyName" 
              type="text" 
              required 
              placeholder="e.g. Acme Corp"
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800 transition-shadow bg-zinc-50/50" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            Email address
          </label>
          <div className="mt-2">
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800 transition-shadow bg-zinc-50/50" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            Password
          </label>
          <div className="mt-2">
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="new-password" 
              required 
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800 transition-shadow bg-zinc-50/50" 
            />
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
            <div className="flex">
              <div className="ml-3 text-sm text-red-700">{errorMsg}</div>
            </div>
          </div>
        )}

        <div>
          <button 
            type="submit" 
            disabled={isPending}
            className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Creating Account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
