import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Ban } from "lucide-react";
import { checkUserRole } from "@/lib/admin-actions";
import { TimeBlockingForm } from "@/components/barber/time-blocking-form";
import { WorkingHoursSettings } from "@/components/barber/working-hours-settings";

export const runtime = "edge";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function BarberSchedule() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/barber/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Zaman Yönetimi
              </h1>
              <p className="mt-2 text-gray-600">
                Çalışma saatleri ve müsaitlik ayarları
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Blocking */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Zaman Bloklama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Belirli tarih ve saatlerde randevu alınmasını engelleyin.
                </p>
                <TimeBlockingForm />
              </CardContent>
            </Card>
          </div>

          {/* Working Hours Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Çalışma Saatleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Genel çalışma saatlerinizi ve kapalı günleri ayarlayın.
                </p>
                <WorkingHoursSettings />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
