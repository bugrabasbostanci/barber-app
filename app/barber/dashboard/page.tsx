import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus } from "lucide-react";
import { checkUserRole } from "@/lib/admin-actions";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";
import { DashboardCriticalStats } from "@/components/barber/dashboard-critical-stats";
import { DashboardImportantStats } from "@/components/barber/dashboard-important-stats";
import { DashboardSecondaryStats } from "@/components/barber/dashboard-secondary-stats";
import { DashboardQuickActions } from "@/components/barber/dashboard-quick-actions";
import { DashboardCriticalStatsSkeleton } from "@/components/skeletons/dashboard-critical-stats-skeleton";
import { DashboardImportantStatsSkeleton } from "@/components/skeletons/dashboard-important-stats-skeleton";
import { DashboardSecondaryStatsSkeleton } from "@/components/skeletons/dashboard-secondary-stats-skeleton";
import { DashboardQuickActionsSkeleton } from "@/components/skeletons/dashboard-quick-actions-skeleton";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberDashboard() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || (userRole.role !== "BARBER" && userRole.role !== "ADMIN")) {
    redirect("/");
  }

  // Get current date in Turkish format using utility
  const getCurrentDate = () => {
    const today = new Date();
    const todayString = dateToLocalString(today);
    return formatTurkishDate(todayString);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-2xl font-bold cursor-pointer">Berber Paneli</h1>
              <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/barber/appointments/new">
              <Button className="bg-black hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Randevu
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Priority 1: Critical Stats - Loads first (Today's appointments) */}
        <Suspense fallback={<DashboardCriticalStatsSkeleton />}>
          <DashboardCriticalStats />
        </Suspense>

        {/* Priority 2: Important Stats - Loads second (Today's customers + Recent appointments) */}
        <Suspense fallback={<DashboardImportantStatsSkeleton />}>
          <DashboardImportantStats />
        </Suspense>

        {/* Priority 3: Secondary Stats - Loads in background (Total statistics) */}
        <Suspense fallback={<DashboardSecondaryStatsSkeleton />}>
          <DashboardSecondaryStats />
        </Suspense>

        {/* Quick Actions - Static content, loads immediately */}
        <Suspense fallback={<DashboardQuickActionsSkeleton />}>
          <DashboardQuickActions />
        </Suspense>
      </div>
    </div>
  );
}
