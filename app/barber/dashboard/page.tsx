import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users2, 
  Clock, 
  BarChart3, 
  Plus, 
  Eye,
  CalendarDays,
  UserCheck,
  Activity
} from "lucide-react";
import {
  getDashboardStats,
  getTodayAppointments,
  checkUserRole,
} from "@/lib/admin-actions";
// date-fns replaced with native Intl.DateTimeFormat

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberDashboard() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  const stats = await getDashboardStats();
  const todayAppointments = await getTodayAppointments();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold">Berber Paneli</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                {new Intl.DateTimeFormat('tr-TR', {
                  day: '2-digit',
                  month: 'long', 
                  year: 'numeric'
                }).format(new Date())}
              </Badge>
              <Button asChild size="sm">
                <Link href="/barber/appointments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Randevu
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <p className="text-muted-foreground">
              Randevuları ve salonu yönetin
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Takvim
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-3">
                  Günlük, haftalık ve aylık görünümler
                </CardDescription>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/barber/calendar">
                    <Eye className="h-4 w-4 mr-2" />
                    Takvime Git
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Randevular
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-3">
                  Randevu oluşturma ve yönetimi
                </CardDescription>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/barber/appointments">
                    <Users2 className="h-4 w-4 mr-2" />
                    Randevulara Git
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Zamanlama
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-3">
                  Çalışma saatleri ve müsaitlik
                </CardDescription>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/barber/schedule">
                    <Clock className="h-4 w-4 mr-2" />
                    Zamanlamaya Git
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bugünkü Randevular
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.todayAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam günlük randevu sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif Personel
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeStaff}
                </div>
                <p className="text-xs text-muted-foreground">
                  Çalışan personel sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kapasite Kullanımı
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  %{stats.capacityUsage}
                </div>
                <p className="text-xs text-muted-foreground">
                  Günlük kapasite oranı
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Bugünkü Randevular
                </CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link href="/barber/appointments">
                    Tümünü Gör
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Bugün için randevu bulunmuyor.
                    </p>
                  </div>
                ) : (
                  todayAppointments.slice(0, 6).map((appointment, index) => (
                    <div key={appointment.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {appointment.customer
                              ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                              : `${appointment.manualCustomerName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.staff.firstName} {appointment.staff.lastName}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">
                            {appointment.startTime}
                          </p>
                          <Badge
                            variant={
                              appointment.status === "CONFIRMED"
                                ? "default"
                                : appointment.status === "SCHEDULED"
                                ? "secondary"
                                : appointment.status === "COMPLETED"
                                ? "outline"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {appointment.status === "CONFIRMED"
                              ? "Onaylandı"
                              : appointment.status === "SCHEDULED"
                              ? "Planlandı"
                              : appointment.status === "COMPLETED"
                              ? "Tamamlandı"
                              : appointment.status === "CANCELLED"
                              ? "İptal"
                              : "Gelmedi"}
                          </Badge>
                        </div>
                      </div>
                      {index < todayAppointments.slice(0, 6).length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
