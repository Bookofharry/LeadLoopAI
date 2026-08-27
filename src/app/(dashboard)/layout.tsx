import { Suspense } from "react";
import { cache } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getPendingReviewCount } from "./review-queue/actions";
import { getPendingTaskCount } from "./tasks/actions";

const getNavigationCounts = cache(async () => {
  const [pendingReviewCount, pendingTaskCount] = await Promise.all([
    getPendingReviewCount(),
    getPendingTaskCount(),
  ]);

  return { pendingReviewCount, pendingTaskCount };
});

async function DesktopSidebar() {
  const { pendingReviewCount, pendingTaskCount } = await getNavigationCounts();

  return (
    <Sidebar
      className="hidden lg:flex"
      pendingReviewCount={pendingReviewCount}
      pendingTaskCount={pendingTaskCount}
    />
  );
}

async function DashboardHeader() {
  const { pendingReviewCount, pendingTaskCount } = await getNavigationCounts();

  return <Header pendingReviewCount={pendingReviewCount} pendingTaskCount={pendingTaskCount} />;
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
        <Suspense fallback={<Header />}>
          <DashboardHeader />
        </Suspense>
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
