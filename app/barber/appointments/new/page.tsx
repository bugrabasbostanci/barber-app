import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { checkUserRole } from "@/lib/admin-actions";
import { ManualAppointmentForm } from "@/components/barber/manual-appointment-form";

// Force dynamic rendering since we use cookies for auth
export const dynamic = "force-dynamic";

export default async function NewBarberAppointment() {
  // Check if user has barber role
  const userRole = await checkUserRole();
  if (!userRole || userRole.role !== "BARBER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/barber/appointments">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-xl font-semibold">Yeni Randevu</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Manuel olarak randevu oluşturun
          </p>
        </div>
        <ManualAppointmentForm />
      </main>
    </div>
  );
}
