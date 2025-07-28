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
import { Calendar, Users2, Clock, Settings, Plus, Eye } from "lucide-react";
import {
  getDashboardStats,
  getTodayAppointments,
  checkUserRole,
} from "@/lib/admin-actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Berber Paneli
              </h1>
              <p className="mt-2 text-gray-600">
                Randevuları ve salonu yönetin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/barber/appointments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Randevu
                </Link>
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                {format(new Date(), "dd MMMM yyyy", { locale: tr })}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Takvim Yönetimi
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Aktif</div>
              <CardDescription className="mt-2">
                Günlük, haftalık ve aylık takvim görünümleri
              </CardDescription>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <Link href="/barber/calendar">
                  <Eye className="h-4 w-4 mr-2" />
                  Takvime Git
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Randevu Yönetimi
              </CardTitle>
              <Users2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktif</div>
              <CardDescription className="mt-2">
                Randevu oluşturma, düzenleme ve iptal işlemleri
              </CardDescription>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <Link href="/barber/appointments">
                  <Users2 className="h-4 w-4 mr-2" />
                  Randevulara Git
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zaman Yönetimi
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Aktif</div>
              <CardDescription className="mt-2">
                Çalışma saatleri ve müsaitlik ayarları
              </CardDescription>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <Link href="/barber/schedule">
                  <Clock className="h-4 w-4 mr-2" />
                  Zamanlamaya Git
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Günlük İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.todayAppointments}
                  </div>
                  <div className="text-sm text-gray-600">
                    Bugünkü Randevular
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.activeStaff}
                    </div>
                    <div className="text-sm text-gray-600">Aktif Personel</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      %{stats.capacityUsage}
                    </div>
                    <div className="text-sm text-gray-600">Kapasite</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Bugünkü Randevular
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href="/barber/appointments">Tümünü Gör</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Bugün için randevu bulunmuyor.
                  </p>
                ) : (
                  todayAppointments.slice(0, 6).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {appointment.customer
                            ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                            : `${appointment.manualCustomerName}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.staff.firstName}{" "}
                          {appointment.staff.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {format(
                            new Date(`2000-01-01T${appointment.startTime}`),
                            "HH:mm"
                          )}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
