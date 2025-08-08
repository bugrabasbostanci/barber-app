import { DashboardCriticalStatsSkeleton } from "@/components/skeletons/dashboard-critical-stats-skeleton";
import { DashboardImportantStatsSkeleton } from "@/components/skeletons/dashboard-important-stats-skeleton";
import { DashboardSecondaryStatsSkeleton } from "@/components/skeletons/dashboard-secondary-stats-skeleton";
import { DashboardQuickActionsSkeleton } from "@/components/skeletons/dashboard-quick-actions-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function BarberDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Priority 1: Critical Stats Skeleton */}
        <DashboardCriticalStatsSkeleton />

        {/* Priority 2: Important Stats Skeleton */}
        <DashboardImportantStatsSkeleton />

        {/* Priority 3: Secondary Stats Skeleton */}
        <DashboardSecondaryStatsSkeleton />

        {/* Quick Actions Skeleton */}
        <DashboardQuickActionsSkeleton />
      </div>
    </div>
  );
}

export function BarberDashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <BarberDashboardSkeleton />
    </div>
  );
}