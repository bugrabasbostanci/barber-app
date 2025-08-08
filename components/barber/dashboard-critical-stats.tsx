import { Card, CardContent } from "@/components/ui/card";
import { getCriticalDashboardData } from "@/lib/dashboard-data";

export async function DashboardCriticalStats() {
  const data = await getCriticalDashboardData();

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4">Bugün</h2>
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {data.todayAppointments}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Bugünkü Randevu
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}