import { Card, CardContent } from "@/components/ui/card";
import { getImportantDashboardData } from "@/lib/dashboard-data";

export async function DashboardImportantStats() {
  const data = await getImportantDashboardData();

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {data.todayCustomers}
            </div>
            <div className="text-sm text-muted-foreground">
              Bugünkü Müşteri
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {data.recentAppointments.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Son Randevular
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Appointments List */}
      {data.recentAppointments.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-3 text-muted-foreground">Son Randevular</h3>
          <div className="space-y-2">
            {data.recentAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{appointment.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.date.toLocaleDateString('tr-TR')} • {appointment.startTime}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : appointment.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {appointment.status === 'CONFIRMED' ? 'Onaylandı' : 
                       appointment.status === 'SCHEDULED' ? 'Planlandı' : 
                       'Diğer'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}