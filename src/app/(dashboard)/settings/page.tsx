import { Settings as SettingsIcon, User, Bell, Shield, Key } from "lucide-react"

export default function SettingsPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <nav className="flex flex-col space-y-1">
            <a href="#" className="bg-zinc-100 text-blue-600 dark:bg-zinc-800/50 dark:text-blue-400 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <User className="text-blue-600 dark:text-blue-400 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Profile
            </a>
            <a href="#" className="text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Bell className="text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Notifications
            </a>
            <a href="#" className="text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Shield className="text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Security
            </a>
            <a href="#" className="text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Key className="text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              API Keys
            </a>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">First name</label>
                  <input type="text" defaultValue="Sarah" className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Last name</label>
                  <input type="text" defaultValue="Johnson" className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Email address</label>
                <input type="email" defaultValue="sarah@leadloop.ai" className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-700" />
              </div>
              <div className="pt-4 flex justify-end">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
