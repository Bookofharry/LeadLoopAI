"use client";

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full items-center justify-center bg-red-50 text-red-900 flex-col gap-4">
          <h2 className="text-2xl font-bold">Fatal Application Error</h2>
          <p className="text-sm font-medium">{error.message || "An unexpected error occurred."}</p>
          <button 
            onClick={() => reset()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-md mt-2 font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
