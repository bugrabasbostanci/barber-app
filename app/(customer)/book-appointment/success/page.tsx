"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Clock,
  UserCheck,
  Phone,
  Home,
  CalendarCheck,
} from "lucide-react";
import { useBookingStore } from "@/lib/stores/booking-store";
import { formatEnglishDate } from "@/lib/utils/dates/formatting";
import type { QueryClient } from "@tanstack/react-query";

export default function BookingSuccessPage() {
  const { bookingData, customerInfo, getStaffName, resetBooking } =
    useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Invalidate appointments cache after successful booking
    // This ensures my-appointments page shows the new appointment
    if (typeof window !== "undefined") {
      const queryClient = (window as { queryClient?: QueryClient }).queryClient;
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["appointments", "my"] });
      }
    }
  }, []);

  useEffect(() => {
    // Reset booking data after 30 seconds
    const timer = setTimeout(() => {
      resetBooking();
    }, 30000);

    return () => clearTimeout(timer);
  }, [resetBooking]);

  const getEndTime = () => {
    if (!bookingData.timeSlot) return "";

    const [hours, minutes] = bookingData.timeSlot.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + 45, 0, 0);
    return endTime.toTimeString().slice(0, 5);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no booking data, redirect to home
  if (!bookingData.date || !bookingData.staffId || !bookingData.timeSlot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">No Appointment Found</h1>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Home Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - consistent with booking pages */}
      <div className="px-4 py-2 bg-background border-b">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Home
        </Link>
      </div>

      {/* Success indicator - similar to booking progress */}
      <div className="px-4 py-4 bg-background border-b">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-xl font-semibold mb-1">
            Your Appointment is Confirmed
          </h1>
          <p className="text-muted-foreground text-sm">
            You can view your appointment details below
          </p>
        </div>
      </div>

      {/* Content - consistent spacing with booking pages */}
      <div className="px-4 py-8 pb-24">
        <div className="space-y-4">
          {/* Date */}
          <Card className="cursor-default">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-primary mr-3" />
                <div>
                  <div className="font-semibold text-base">
                    {formatEnglishDate(bookingData.date)}
                  </div>
                  <div className="text-sm text-muted-foreground">Date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card className="cursor-default">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <UserCheck className="w-6 h-6 text-primary mr-3" />
                <div>
                  <div className="font-semibold text-base">
                    {getStaffName(bookingData.staffId)}
                  </div>
                  <div className="text-sm text-muted-foreground">Barber</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time */}
          <Card className="cursor-default">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-primary mr-3" />
                <div>
                  <div className="font-semibold text-base">
                    {bookingData.timeSlot} - {getEndTime()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    45 minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card className="cursor-default">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-primary mr-3" />
                <div>
                  <div className="font-semibold text-base">
                    {customerInfo.phone}
                  </div>
                  <div className="text-sm text-muted-foreground">Contact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes if any */}
          {customerInfo.notes && (
            <Card className="cursor-default">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Notes</div>
                <div className="text-sm font-medium">{customerInfo.notes}</div>
              </CardContent>
            </Card>
          )}

          {/* Important Notice */}
          <Card className="cursor-default border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">
                    Important Reminders
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>
                      • Please notify us at least 2 hours before your
                      appointment to cancel
                    </li>
                    <li>
                      • You can view and manage your appointments from your
                      profile
                    </li>
                    <li>
                      • Please arrive at the salon 10 minutes before your
                      appointment time
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed bottom navigation - consistent with booking pages */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex space-x-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home Page
            </Button>
          </Link>

          <Link href="/my-appointments" className="flex-1">
            <Button size="lg" className="w-full">
              <CalendarCheck className="w-4 h-4 mr-2" />
              My Appointments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
