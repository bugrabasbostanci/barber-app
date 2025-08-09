import { Card, CardContent } from "@/components/ui/card";

interface Appointment {
  id: string;
  status: string;
}

interface AppointmentsStatsProps {
  appointments: Appointment[];
}

export function AppointmentsStats({ appointments }: AppointmentsStatsProps) {
  const upcomingCount = appointments.filter(
    (apt) => apt.status === "CONFIRMED" || apt.status === "SCHEDULED"
  ).length;
  
  const completedCount = appointments.filter(
    (apt) => apt.status === "COMPLETED"
  ).length;
  
  const cancelledCount = appointments.filter(
    (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
  ).length;
  
  const totalCount = appointments.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {upcomingCount}
          </div>
          <div className="text-sm text-muted-foreground">Yaklaşan</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-sm text-muted-foreground">Tamamlanan</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {cancelledCount}
          </div>
          <div className="text-sm text-muted-foreground">İptal</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">
            {totalCount}
          </div>
          <div className="text-sm text-muted-foreground">Toplam</div>
        </CardContent>
      </Card>
    </div>
  );
}