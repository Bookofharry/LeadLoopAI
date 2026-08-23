import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getPendingReviewCount } from "./review-queue/actions";

async function DesktopSidebar() {
  const pendingCount = await getPendingReviewCount();
  return <Sidebar className="hidden lg:flex" pendingReviewCount={pendingCount} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Suspense fallback={<Sidebar className="hidden lg:flex" />}>
        <DesktopSidebar />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
