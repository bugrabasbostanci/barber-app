"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import { BUSINESS_RULES } from "@/lib/constants";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react";

// Types based on our Prisma schema
interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  shop: {
    name: string;
    address: string;
  };
  createdAt: string;
}

function MyAppointmentsContent() {
  const { user, loading, isAuthorized } = useRequireCustomer();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check for success parameter and show success message
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setSuccessMessage("Randevunuz başarıyla oluşturuldu!");
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch appointments from API
  useEffect(() => {
    if (user) {
      async function fetchAppointments() {
        try {
          const response = await fetch("/api/my-appointments");
          if (response.ok) {
            const appointmentsData = await response.json();
            setAppointments(appointmentsData);
          } else {
            console.error("Failed to fetch appointments");
            setAppointments([]);
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setAppointments([]);
        }
      }

      fetchAppointments();
    }
  }, [user]);

  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      SCHEDULED: {
        label: "Planlandı",
        variant: "secondary" as const,
      },
      CONFIRMED: {
        label: "Onaylandı",
        variant: "default" as const,
      },
      COMPLETED: {
        label: "Tamamlandı",
        variant: "outline" as const,
      },
      CANCELLED: {
        label: "İptal Edildi",
        variant: "destructive" as const,
      },
      NO_SHOW: {
        label: "Gelmedi",
        variant: "destructive" as const,
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${
      days[date.getDay()]
    }`;
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.startTime}`
    );
    const now = new Date();
    const hoursDiff =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      hoursDiff > BUSINESS_RULES.CANCELLATION_HOURS &&
      ["SCHEDULED", "CONFIRMED"].includes(appointment.status)
    );
  };

  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date();

    switch (filter) {
      case "upcoming":
        return appointments.filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.startTime}:00`);
          return (
            aptDate > now && ["SCHEDULED", "CONFIRMED"].includes(apt.status)
          );
        });
      case "past":
        return appointments.filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.startTime}:00`);
          return (
            aptDate <= now ||
            ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status)
          );
        });
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments(appointments);

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId);

    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the appointment status locally
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: "CANCELLED" as const }
              : apt
          )
        );

        setShowCancelDialog(null);

        // Show success message in a better way
        setSuccessMessage("Randevunuz başarıyla iptal edildi");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        // Show error message from API
        alert(result.error || "Randevu iptal edilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Randevu iptal edilirken hata oluştu:", error);
      alert("Randevu iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelDialog = (appointmentId: string) => {
    setShowCancelDialog(appointmentId);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Yetkilendirme kontrol ediliyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Randevularım</h1>
            <Link href="/book-appointment">
              <Button size="sm">+ Yeni Randevu</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Modern Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">{successMessage}</p>
                  <p className="text-sm text-green-600 mt-1">
                    İşlem başarıyla tamamlandı
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { key: "upcoming", label: "Aktif" },
            { key: "past", label: "Geçmiş" },
            { key: "all", label: "Tümü" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {filter === "upcoming"
                  ? "Aktif randevunuz yok"
                  : filter === "past"
                  ? "Geçmiş randevunuz yok"
                  : "Randevunuz yok"}
              </h3>
              <p className="text-muted-foreground">
                Yeni randevu oluşturmak için butona tıklayın
              </p>
            </div>
            <Button asChild>
              <Link href="/book-appointment">Randevu Al</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="border-l-4 border-l-foreground"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {appointment.staff.firstName}{" "}
                        {appointment.staff.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {appointment.shop.address}
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm">{appointment.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canCancelAppointment(appointment) && (
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => openCancelDialog(appointment.id)}
                        disabled={cancellingId === appointment.id}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {cancellingId === appointment.id
                          ? "İptal Ediliyor..."
                          : "Randevuyu İptal Et"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modern Cancellation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Randevuyu İptal Et
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bu işlem geri alınamaz
                    </p>
                  </div>
                </div>

                {(() => {
                  const appointment = appointments.find(
                    (apt) => apt.id === showCancelDialog
                  );
                  if (!appointment) return null;

                  return (
                    <div className="bg-gray-50 rounded-lg p-3 mb-6">
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">
                          {formatDate(appointment.date)} •{" "}
                          {appointment.startTime}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {appointment.staff.firstName}{" "}
                          {appointment.staff.lastName}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={closeCancelDialog}
                    className="flex-1"
                    disabled={cancellingId === showCancelDialog}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      showCancelDialog &&
                      handleCancelAppointment(showCancelDialog)
                    }
                    disabled={cancellingId === showCancelDialog}
                  >
                    {cancellingId === showCancelDialog ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        İptal Ediliyor
                      </div>
                    ) : (
                      "İptal Et"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="px-4 py-3">
              <div className="flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-900">
                  Yükleniyor...
                </div>
              </div>
            </div>
          </header>
        </div>
      }
    >
      <MyAppointmentsContent />
    </Suspense>
  );
}
