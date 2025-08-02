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
import { 
  Calendar, 
  Users2, 
  Clock, 
  Plus, 
  Eye,
  CalendarDays
} from "lucide-react";
import {
  getDashboardStats,
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
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
          </div>

        </div>
      </main>
    </div>
  );
}
