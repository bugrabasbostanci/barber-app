"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS_RULES } from "@/lib/constants";
import {
  Calendar,
  Clock,
  User,
  Phone,
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

export default function MyAppointmentsPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success parameter and show success message
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Sample data - production'da API'den gelecek
  useEffect(() => {
    if (user) {
      // Mock appointments data
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          date: "2024-01-30",
          startTime: "14:00",
          endTime: "14:45",
          status: "CONFIRMED",
          notes: "",
          staff: {
            id: "staff-1",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            role: "BARBER",
          },
          shop: {
            name: "BerberApp Salon",
            address: "Çankaya, Ankara",
          },
          createdAt: "2024-01-25T10:00:00Z",
        },
        {
          id: "2",
          date: "2024-01-15",
          startTime: "16:30",
          endTime: "17:15",
          status: "COMPLETED",
          notes: "Saç kesimi ve sakal traşı",
          staff: {
            id: "staff-3",
            firstName: "Mustafa",
            lastName: "Demir",
            role: "BARBER",
          },
          shop: {
            name: "BerberApp Salon",
            address: "Çankaya, Ankara",
          },
          createdAt: "2024-01-10T09:30:00Z",
        },
        {
          id: "3",
          date: "2024-02-05",
          startTime: "11:00",
          endTime: "11:45",
          status: "SCHEDULED",
          notes: "",
          staff: {
            id: "staff-2",
            firstName: "Mehmet",
            lastName: "Kaya",
            role: "EMPLOYEE",
          },
          shop: {
            name: "BerberApp Salon",
            address: "Çankaya, Ankara",
          },
          createdAt: "2024-01-28T14:20:00Z",
        },
      ];
      setAppointments(mockAppointments);
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
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
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
          const aptDate = new Date(`${apt.date}T${apt.startTime}`);
          return (
            aptDate > now && !["CANCELLED", "NO_SHOW"].includes(apt.status)
          );
        });
      case "past":
        return appointments.filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.startTime}`);
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
      // In production, this would be an API call
      // const response = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'POST' });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the appointment status locally
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "CANCELLED" as const }
            : apt
        )
      );

      setShowCancelDialog(null);
    } catch (error) {
      console.error("Randevu iptal edilirken hata oluştu:", error);
      // In production, show error toast/notification
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Giriş Gerekli</CardTitle>
            <CardDescription>
              Randevularınızı görmek için giriş yapmalısınız
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              Randevularım
            </h1>
            <Link href="/book-appointment">
              <Button size="sm">+ Yeni Randevu</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Randevunuz Başarıyla Oluşturuldu!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Randevunuz sistem tarafından onaylandı. Detayları aşağıda görebilirsiniz.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
          {[
            { key: "upcoming", label: "Yaklaşan" },
            { key: "past", label: "Geçmiş" },
            { key: "all", label: "Tümü" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({filterAppointments(appointments).length})
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "upcoming"
                  ? "Yaklaşan randevunuz yok"
                  : filter === "past"
                  ? "Geçmiş randevunuz yok"
                  : "Randevunuz yok"}
              </h3>
              <p className="text-gray-500 mb-6">
                Yeni bir randevu oluşturmak için aşağıdaki butona tıklayın
              </p>
              <Link href="/book-appointment">
                <Button>Randevu Al</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({BUSINESS_RULES.APPOINTMENT_DURATION} dk)
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {appointment.staff.firstName}{" "}
                        {appointment.staff.lastName}
                      </span>
                      <Badge
                        variant={appointment.staff.role === "BARBER" ? "secondary" : "outline"}
                      >
                        {appointment.staff.role === "BARBER"
                          ? "Usta Berber"
                          : "Berber"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {appointment.shop.address}
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    {canCancelAppointment(appointment) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openCancelDialog(appointment.id)}
                        disabled={cancellingId === appointment.id}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {cancellingId === appointment.id
                          ? "İptal Ediliyor..."
                          : "İptal Et"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Detaylar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Randevuyu İptal Et</CardTitle>
                <CardDescription>
                  Bu randevuyu iptal etmek istediğinizden emin misiniz?
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const appointment = appointments.find(
                    (apt) => apt.id === showCancelDialog
                  );
                  if (!appointment) return null;

                  return (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Tarih:</strong> {formatDate(appointment.date)}
                        </p>
                        <p>
                          <strong>Saat:</strong> {appointment.startTime} -{" "}
                          {appointment.endTime}
                        </p>
                        <p>
                          <strong>Personel:</strong>{" "}
                          {appointment.staff.firstName}{" "}
                          {appointment.staff.lastName}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Uyarı:</strong> İptal edilen randevular geri
                    alınamaz.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={closeCancelDialog}
                    className="flex-1"
                    disabled={cancellingId === showCancelDialog}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Vazgeç
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      showCancelDialog &&
                      handleCancelAppointment(showCancelDialog)
                    }
                    className="flex-1"
                    disabled={cancellingId === showCancelDialog}
                  >
                    {cancellingId === showCancelDialog ? (
                      "İptal Ediliyor..."
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Evet, İptal Et
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
