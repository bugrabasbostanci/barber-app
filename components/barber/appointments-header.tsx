import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppointmentsHeader() {
  return (
    <header className="bg-background border-b px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link href="/barber/dashboard">
            <Button variant="ghost" size="lg" className="text-base">
              <ArrowLeft className="w-6 h-6 mr-3" />
              Back
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-xl sm:text-2xl font-bold">Appointment Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              View and manage all appointments
            </p>
          </div>
        </div>
        <Link href="/barber/appointments/new">
          <Button
            size="lg"
            className="bg-black hover:bg-gray-800 dark:bg-white  dark:hover:bg-gray-200 text-white dark:text-black text-base px-3 py-3 sm:px-6 w-auto sm:w-auto"
          >
            <Plus className="w-5 h-5 sm:mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>
    </header>
  );
}
