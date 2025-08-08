import { Card, CardContent } from "@/components/ui/card";
import { getSecondaryDashboardData } from "@/lib/dashboard-data";

export async function DashboardSecondaryStats() {
  const data = await getSecondaryDashboardData();

  return (
    <div className="mb-4">
      <h3 className="text-md font-medium mb-3 text-muted-foreground">Genel İstatistikler</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {data.totalCustomers}
            </div>
            <div className="text-sm text-muted-foreground">
              Toplam Müşteri
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {data.totalUsers}
            </div>
            <div className="text-sm text-muted-foreground">
              Toplam Kullanıcı
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}