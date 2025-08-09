"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import { useBookingStore } from "@/lib/stores/booking-store";
import { BookingStepSkeleton } from "@/components/skeletons/booking-skeleton";
import { BookingProgress } from "./components/booking-progress";
import { StaffSelection } from "./components/staff-selection";
import { DateSelection } from "./components/date-selection";
import { TimeSelection } from "./components/time-selection";
import { CustomerInfoForm } from "./components/customer-info-form";
import { BookingNavigation } from "./components/booking-navigation";

export default function BookAppointmentPage() {
  const { loading, isAuthorized } = useRequireCustomer();
  const router = useRouter();

  const {
    currentStep,
    isBooking,
    phoneError,
    bookingData,
    customerInfo,
    nextStep,
    prevStep,
    setPhoneError,
    updateBookingData,
    updateCustomerInfo,
    fetchUserProfile,
    fetchStaffMembers,
    submitBooking,
    canProceed,
  } = useBookingStore();

  useEffect(() => {
    if (isAuthorized) {
      fetchUserProfile();
      fetchStaffMembers();
    }
  }, [isAuthorized, fetchUserProfile, fetchStaffMembers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BookingProgress currentStep={1} totalSteps={5} />
        <div className="px-4 py-8">
          <BookingStepSkeleton />
        </div>
      </div>
    );
  }

  const handleBookingSubmission = async () => {
    const success = await submitBooking();
    if (success) {
      // Use Next.js router for soft redirect to preserve state
      router.push('/book-appointment/success');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateSelection
            selectedDate={bookingData.date}
            onDateSelect={(date) => updateBookingData("date", date)}
          />
        );
      case 2:
        return (
          <StaffSelection
            selectedStaff={bookingData.staffId}
            onStaffSelect={(staffId) => updateBookingData("staffId", staffId)}
          />
        );
      case 3:
        return (
          <TimeSelection
            selectedTime={bookingData.timeSlot}
            onTimeSelect={(time) => updateBookingData("timeSlot", time)}
            selectedDate={bookingData.date}
            selectedStaff={bookingData.staffId}
          />
        );
      case 4:
        return (
          <CustomerInfoForm
            customerInfo={customerInfo}
            onCustomerInfoChange={updateCustomerInfo}
            phoneError={phoneError}
            onPhoneErrorChange={setPhoneError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-2 bg-background border-b">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Ana Sayfa
        </Link>
      </div>

      <BookingProgress currentStep={currentStep} totalSteps={4} />

      <div className="px-4 py-8 pb-24">{renderStepContent()}</div>

      <BookingNavigation
        currentStep={currentStep}
        totalSteps={4}
        canProceed={canProceed()}
        isBooking={isBooking}
        onPrevious={prevStep}
        onNext={nextStep}
        onSubmit={handleBookingSubmission}
      />
    </div>
  );
}