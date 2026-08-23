import { Bell, Search, UserCircle } from "lucide-react"
import { logout } from "@/app/(auth)/actions"
import { MobileSidebar } from "./MobileSidebar"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-1 items-center gap-4">
        <MobileSidebar />
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500"
            placeholder="Search leads, companies, or tasks..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-zinc-400 hover:text-zinc-500 transition-colors">
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <UserCircle className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
