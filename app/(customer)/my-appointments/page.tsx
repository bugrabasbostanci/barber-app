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
import { formatTurkishDateShort } from "@/lib/date-time";
import { Calendar, Clock, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useMyAppointments, useCancelAppointment, useAppointmentUtils } from "@/hooks/queries/useAppointments";
import type { Appointment } from "@/lib/api/appointments";
import { MyAppointmentsSkeleton } from "@/components/skeletons/my-appointments-skeleton";

function MyAppointmentsContent() {
  const { isAuthorized } = useRequireCustomer();

  // React Query hooks
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
        return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Tamamlandı</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">İptal Edildi</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-gray-100 text-gray-800">Gelmedi</Badge>;
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
              İptal Et
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
              <Link href="/">Tekrar Randevu Al</Link>
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
  const past = getPastAppointments();

  // Show error if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              Bu sayfaya erişim yetkiniz bulunmuyor. Randevularınızı
              görüntüleyebilmek için müşteri hesabı ile giriş yapmanız
              gerekiyor.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button asChild>
              <Link href="/auth/login">Giriş Yap</Link>
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
              Randevuyu İptal Et
            </DialogTitle>
            <DialogDescription>
              Randevunuzu iptal etmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
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
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İptal Ediliyor...
                </div>
              ) : (
                "Randevuyu İptal Et"
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
        <div className="text-center p-6 bg-blue-50 rounded-2xl">
          <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
          <p className="text-sm text-muted-foreground">Yaklaşan</p>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-2xl">
          <p className="text-2xl font-bold text-green-600">{past.length}</p>
          <p className="text-sm text-muted-foreground">Geçmiş</p>
        </div>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
          <TabsTrigger value="past">Geçmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-lg mb-2">
                  Yaklaşan randevunuz bulunmuyor
                </h3>
                <p className="text-muted-foreground mb-6">Yeni bir randevu alın</p>
                <Link href="/">
                  <Button size="lg" className="w-full">
                    Randevu Al
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
                  Geçmiş randevunuz bulunmuyor
                </h3>
                <p className="text-muted-foreground">
                  Randevu geçmişiniz burada görünecek
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>{past.map(renderAppointmentCard)}</div>
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
