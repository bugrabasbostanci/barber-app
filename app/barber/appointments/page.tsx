import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { checkUserRole, getRecentAppointments } from "@/lib/admin-actions";
import { AppointmentsList } from "@/components/barber/appointments-list";

// export const runtime = "edge";
export const runtime = "nodejs";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberAppointments() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  const appointments = await getRecentAppointments(50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/barber/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Randevu Yönetimi
                </h1>
                <p className="mt-2 text-gray-600">
                  Tüm randevuları görüntüleyin ve yönetin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/barber/appointments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Randevu
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtreleme ve Arama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Müşteri adı veya telefon ile arama yapın..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <AppointmentsList appointments={appointments} />
      </div>
    </div>
  );
}
