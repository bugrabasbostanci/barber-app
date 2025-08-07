import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Calendar, Users, Clock, Plus, ArrowRight } from "lucide-react";
import { getDashboardStats, checkUserRole } from "@/lib/admin-actions";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberDashboard() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  const stats = await getDashboardStats();

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
        {/* Today's Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Bugün</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.todayAppointments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Bugünkü Randevu
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.todayCustomers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Bugünkü Müşteri
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.totalCustomers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Toplam Müşteri
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Toplam Kullanıcı
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calendar */}
            <Link href="/barber/calendar">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <h3 className="font-semibold">Takvim</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Günlük, haftalık görünüm
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Appointments */}
            <Link href="/barber/appointments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 mr-2" />
                        <h3 className="font-semibold">Randevular</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Randevu yönetimi
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Schedule */}
            <Link href="/barber/schedule">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 mr-2" />
                        <h3 className="font-semibold">Zaman Yönetimi</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Çalışma saatleri
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
