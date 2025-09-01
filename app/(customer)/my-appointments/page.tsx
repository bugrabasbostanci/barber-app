"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import { formatTurkishDateShort } from "@/lib/utils";
import { Calendar, Clock, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useMyAppointments, useCancelAppointment, useAppointmentUtils } from "@/hooks/queries/useAppointments";
import type { Appointment } from "@/lib/api/appointments";
import { MyAppointmentsSkeleton } from "@/components/skeletons/my-appointments-skeleton";

function MyAppointmentsContent() {
  const { isAuthorized } = useRequireCustomer();

  // React Query hooks - now with automatic refresh on focus/mount
  const { isLoading: appointmentsLoading, error: queryError } = useMyAppointments();
  const cancelMutation = useCancelAppointment();
  const { getUpcomingAppointments, getPastAppointments, canCancelAppointment } = useAppointmentUtils();

  // Convert query error to string
  const error = queryError?.message || '';

  // Local modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Modal handlers
  const openCancelModal = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      await cancelMutation.mutateAsync(appointmentToCancel.id);
      closeCancelModal();
    } catch (error) {
      // Error is handled by React Query and can be shown via cancelMutation.error
      console.error('Failed to cancel appointment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          {getStatusBadge(appointment.status)}
          <span className="text-sm text-muted-foreground">{appointment.shop.name}</span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">{formatDate(appointment.date)}</span>
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
            <span>{formatTimeRange(appointment.startTime)}</span>
          </div>

          <div className="flex items-center">
            <UserCheck className="w-4 h-4 mr-3 text-muted-foreground" />
            <span>
              {appointment.staff.firstName} {appointment.staff.lastName}
            </span>
          </div>

          {appointment.notes && (
            <div className="flex items-start">
              <div className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground">💬</div>
              <span className="text-sm text-muted-foreground">{appointment.notes}</span>
            </div>
          )}
        </div>

        {["SCHEDULED", "CONFIRMED"].includes(appointment.status) ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openCancelModal(appointment)}
              disabled={
                !canCancelAppointment(appointment) ||
                cancelMutation.isPending
              }
            >
              Cancel
            </Button>
          </div>
        ) : appointment.status === "COMPLETED" ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              asChild
            >
              <Link href="/">Book Again</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const formatDate = (dateString: string) => {
    return formatTurkishDateShort(dateString);
  };

  const formatTimeRange = (time: string, duration: number = 45) => {
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime.getTime() + duration * 60000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    return `${formatTime(startTime)}-${formatTime(endTime)}`;
  };

  // Get computed data from React Query hooks
  const upcoming = getUpcomingAppointments();
  const past = getPastAppointments().slice(0, 3); // Show last 3 past appointments

  // Show error if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              You do not have permission to access this page. You need to
              log in with a customer account to view your appointments.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton while appointments are loading
  if (appointmentsLoading) {
    return <MyAppointmentsSkeleton />;
  }

  return (
    <div className="px-4 py-6">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Appointments Content */}
      <AppointmentsList
        upcoming={upcoming}
        past={past}
        renderAppointmentCard={renderAppointmentCard}
      />

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Appointment Details */}
          {appointmentToCancel && (
            <div className="bg-muted/50 rounded-lg p-4 my-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(appointmentToCancel.date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm">
                    {formatTimeRange(appointmentToCancel.startTime)}
                  </span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm">
                    {appointmentToCancel.staff.firstName}{" "}
                    {appointmentToCancel.staff.lastName}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeCancelModal}
              disabled={cancelMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </div>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate component for appointments list with its own loading state
function AppointmentsList({
  upcoming,
  past,
  renderAppointmentCard,
}: {
  upcoming: Appointment[];
  past: Appointment[];
  renderAppointmentCard: (appointment: Appointment) => React.ReactNode;
}) {
  // AppointmentsList doesn't need its own loading state anymore

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {upcoming.length}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Upcoming Appointments
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {past.length}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Past Appointments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-lg mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground mb-6">Book a new appointment</p>
                <Link href="/">
                  <Button size="lg" className="w-full">
                    Book Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div>{upcoming.map(renderAppointmentCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-lg mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground">
                  Your appointment history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {past.length > 0 && (
                <div className="text-sm text-muted-foreground mb-4 text-center">
                  Showing your last 3 past appointments
                </div>
              )}
              <div>{past.map(renderAppointmentCard)}</div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function MyAppointmentsPage() {
  // Route-level loading.tsx handles the initial loading state
  return <MyAppointmentsContent />;
}
