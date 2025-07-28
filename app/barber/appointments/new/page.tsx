import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { checkUserRole } from "@/lib/admin-actions";
import { NewAppointmentForm } from "@/components/barber/new-appointment-form";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function NewBarberAppointment() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/barber/appointments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Yeni Randevu Oluştur
              </h1>
              <p className="mt-2 text-gray-600">
                Manuel olarak randevu oluşturun
              </p>
            </div>
          </div>
        </div>

        <NewAppointmentForm />
      </div>
    </div>
  );
}
