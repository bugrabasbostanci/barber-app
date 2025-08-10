import { getSecondaryDashboardData } from "@/lib/dashboard-data";
import { SecondaryStatsCard, SubsectionHeader } from "@/shared/components";
import { Users, UserCheck } from "lucide-react";

export async function DashboardSecondaryStats() {
  const data = await getSecondaryDashboardData();

  return (
    <div className="mb-4">
      <SubsectionHeader 
        title="Genel İstatistikler" 
        className="mb-3" 
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecondaryStatsCard
          title="Toplam Müşteri"
          value={data.totalCustomers}
          color="orange"
          icon={Users}
        />
        <SecondaryStatsCard
          title="Toplam Kullanıcı"
          value={data.totalUsers}
          color="indigo"
          icon={UserCheck}
        />
      </div>
    </div>
  );
}