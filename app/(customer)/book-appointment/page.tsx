"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { BookingWizard } from "@/features/booking";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function BookAppointmentContent() {
  const { loading, isAuthorized } = useRequireCustomer();
  const router = useRouter();

  const handleBookingComplete = () => {
    // Redirect to success page or my appointments
    router.push('/my-appointments?success=true');
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Randevu almak için giriş yapmanız gerekiyor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingWizard
        onComplete={handleBookingComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      }
    >
      <BookAppointmentContent />
    </Suspense>
  );
}