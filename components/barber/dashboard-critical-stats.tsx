import { getCriticalDashboardData } from "@/lib/dashboard-data";
import { CriticalStatsCard, SectionTitle } from "@/shared/components";
import { Calendar } from "lucide-react";

export async function DashboardCriticalStats() {
  const data = await getCriticalDashboardData();

  return (
    <div className="mb-4">
      <SectionTitle title="Bugün" className="mb-4" />
      <div className="grid grid-cols-1 gap-4">
        <CriticalStatsCard
          title="Bugünkü Randevu"
          value={data.todayAppointments}
          color="blue"
          icon={Calendar}
        />
      </div>
    </div>
  );
}