"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4 p-8 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-2">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Something went wrong!</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        {error.message || "An unexpected runtime error occurred. Please try again."}
      </p>
      <button 
        onClick={() => reset()} 
        className="px-6 py-2.5 font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md mt-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
