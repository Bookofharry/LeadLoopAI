import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4 p-8 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-zinc-200 dark:bg-zinc-900 p-4 rounded-full mb-2">
        <FileQuestion className="h-12 w-12 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Page Not Found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/overview"
        className="px-6 py-2.5 font-medium bg-blue-600 text-white rounded-md mt-4 hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
