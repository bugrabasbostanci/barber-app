import { getImportantDashboardData } from "@/lib/dashboard-data";
import { 
  ImportantStatsCard, 
  SubsectionHeader,
  InfoCard,
  AppointmentStatusBadge 
} from "@/shared/components";
import { Users, Clock } from "lucide-react";

export async function DashboardImportantStats() {
  const data = await getImportantDashboardData();

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ImportantStatsCard
          title="Bugünkü Müşteri"
          value={data.todayCustomers}
          color="green"
          icon={Users}
        />
        <ImportantStatsCard
          title="Son Randevular"
          value={data.recentAppointments.length}
          color="purple"
          icon={Clock}
        />
      </div>
      
      {/* Recent Appointments List */}
      {data.recentAppointments.length > 0 && (
        <div>
          <SubsectionHeader 
            title="Son Randevular" 
            className="mb-3" 
          />
          <div className="space-y-2">
            {data.recentAppointments.map((appointment) => (
              <InfoCard
                key={appointment.id}
                fields={[
                  {
                    label: 'Müşteri',
                    value: appointment.customerName
                  },
                  {
                    label: 'Tarih & Saat',
                    value: `${appointment.date.toLocaleDateString('tr-TR')} • ${appointment.startTime}`
                  }
                ]}
                actions={
                  <AppointmentStatusBadge 
                    status={appointment.status as 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'}
                    size="sm"
                  />
                }
                variant="compact"
                layout="horizontal"
                className="border-l-4 border-l-purple-500"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}