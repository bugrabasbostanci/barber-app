import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { checkUserRole } from "@/lib/admin-actions";
import { CalendarView } from "@/components/barber/calendar-view";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberCalendar() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

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
                  Takvim Yönetimi
                </h1>
                <p className="mt-2 text-gray-600">
                  Randevuları görüntüleyin ve yönetin
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

        <CalendarView />
      </div>
    </div>
  );
}
