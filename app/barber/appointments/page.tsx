"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateToLocalString, formatTurkishDateShort } from "@/lib/date-time";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string; // API returns string format
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  staff: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: string; // API returns string format
}

export default function BarberAppointments() {
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-role");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        if (!data.success || data.role !== "BARBER") {
          router.push("/auth/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/barber/appointments");
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (
            appointmentsResult.success &&
            Array.isArray(appointmentsResult.data)
          ) {
            setAppointments(appointmentsResult.data);
          }
        }

        // Fetch staff
        const staffResponse = await fetch("/api/staff");
        if (staffResponse.ok) {
          const staffResult = await staffResponse.json();
          if (staffResult.success && Array.isArray(staffResult.data)) {
            setStaffMembers(staffResult.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const customerName = appointment.customer
      ? `${appointment.customer.firstName || ""} ${
          appointment.customer.lastName || ""
        }`.trim()
      : appointment.manualCustomerName || "";

    const customerPhone =
      appointment.customer?.phone || appointment.manualCustomerPhone || "";

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.includes(searchTerm);

    const staffName = `${appointment.staff.firstName || ""} ${
      appointment.staff.lastName || ""
    }`.trim();
    const matchesStaff = selectedStaff === "all" || staffName === selectedStaff;

    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;

    const matchesDate =
      !selectedDate || appointment.date === dateToLocalString(selectedDate);

    return matchesSearch && matchesStaff && matchesStatus && matchesDate;
  });

  // Group appointments by status
  const upcomingAppointments = filteredAppointments.filter(
    (apt) => apt.status === "CONFIRMED" || apt.status === "SCHEDULED"
  );
  const completedAppointments = filteredAppointments.filter(
    (apt) => apt.status === "COMPLETED"
  );
  const cancelledAppointments = filteredAppointments.filter(
    (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Onaylandı";
      case "SCHEDULED":
        return "Planlandı";
      case "COMPLETED":
        return "Tamamlandı";
      case "CANCELLED":
        return "İptal";
      case "NO_SHOW":
        return "Gelmedi";
      default:
        return status;
    }
  };

  const getStaffColor = () => {
    return "text-blue-600"; // Simplified for now
  };

  const formatDate = (dateString: string) => {
    return formatTurkishDateShort(dateString);
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        setShowDeleteDialog(false);
        setAppointmentToDelete(null);
        alert("Randevu başarıyla silindi!");
      } else {
        alert("Randevu silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Randevu silinirken bir hata oluştu.");
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const customerName = appointment.customer
      ? `${appointment.customer.firstName || ""} ${
          appointment.customer.lastName || ""
        }`.trim()
      : appointment.manualCustomerName || "Bilinmeyen Müşteri";

    const customerPhone =
      appointment.customer?.phone || appointment.manualCustomerPhone || "";
    const staffName = `${appointment.staff.firstName || ""} ${
      appointment.staff.lastName || ""
    }`.trim();

    return (
      <Card
        key={appointment.id}
        className="mb-4 hover:shadow-md transition-shadow"
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>
              <span className={`font-semibold text-lg ${getStaffColor()}`}>
                {staffName}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-3 text-gray-400" />
                <span className="font-semibold text-lg">{customerName}</span>
              </div>
              {customerPhone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">{customerPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span className="font-medium">
                  {formatDate(appointment.date)}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-gray-400" />
                <span>
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  Not: {appointment.notes}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detaylar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
            {customerPhone && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ara
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setAppointmentToDelete(appointment.id);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/barber/dashboard">
              <Button variant="ghost" size="lg" className="text-base">
                <ArrowLeft className="w-6 h-6 mr-3" />
                Geri
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Randevu Yönetimi
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Tüm randevuları görüntüle ve yönet
              </p>
            </div>
          </div>
          <Link href="/barber/appointments/new">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white text-base px-3 py-3 sm:px-6 w-auto sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              Yeni Randevu
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {/* Filters - Responsive */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Müşteri adı veya telefon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Staff Filter */}
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Personel</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem
                      key={staff.id}
                      value={`${staff.firstName} ${staff.lastName}`.trim()}
                    >
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                  <SelectItem value="SCHEDULED">Planlandı</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="CANCELLED">İptal</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      formatTurkishDateShort(dateToLocalString(selectedDate))
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    locale={tr}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDate(undefined);
                          setCalendarOpen(false);
                        }}
                      >
                        Temizle
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Statistics - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {upcomingAppointments.length}
              </div>
              <div className="text-sm text-gray-600">Yaklaşan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedAppointments.length}
              </div>
              <div className="text-sm text-gray-600">Tamamlanan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {cancelledAppointments.length}
              </div>
              <div className="text-sm text-gray-600">İptal</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredAppointments.length}
              </div>
              <div className="text-sm text-gray-600">Toplam</div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12 text-sm sm:text-base">
            <TabsTrigger value="upcoming">
              Yaklaşan ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Tamamlanan ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              İptal ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    Yaklaşan randevu bulunamadı
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Filtreleri kontrol edin veya yeni randevu oluşturun
                  </p>
                  <Link href="/barber/appointments/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Randevu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    Tamamlanan randevu bulunamadı
                  </h3>
                  <p className="text-gray-500">Filtreleri kontrol edin</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {completedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    İptal edilen randevu bulunamadı
                  </h3>
                  <p className="text-gray-500">Filtreleri kontrol edin</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {cancelledAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Randevuyu Sil</DialogTitle>
              <DialogDescription>
                Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri
                alınamaz.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  appointmentToDelete &&
                  handleDeleteAppointment(appointmentToDelete)
                }
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
