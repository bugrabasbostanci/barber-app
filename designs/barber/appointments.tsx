"use client";
// done
import { useState } from "react";
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
import Link from "next/link";

export default function BarberAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(
    null
  );

  // Mock appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: "2024-01-15",
      time: "09:30",
      endTime: "10:15",
      customer: "Ahmet Yılmaz",
      phone: "(555) 123-4567",
      staff: "Berber",
      service: "Saç Kesimi",
      price: 35,
      status: "confirmed",
      notes: "Kısa kesilmesini istiyor",
    },
    {
      id: 2,
      date: "2024-01-15",
      time: "11:00",
      endTime: "11:45",
      customer: "Mehmet Kaya",
      phone: "(555) 234-5678",
      staff: "Berber",
      service: "Saç + Sakal",
      price: 50,
      status: "confirmed",
      notes: "",
    },
    {
      id: 3,
      date: "2024-01-15",
      time: "10:15",
      endTime: "11:00",
      customer: "Ali Demir",
      phone: "(555) 345-6789",
      staff: "Çalışan",
      service: "Sakal Kesimi",
      price: 20,
      status: "pending",
      notes: "İlk defa geliyor",
    },
    {
      id: 4,
      date: "2024-01-16",
      time: "14:15",
      endTime: "15:00",
      customer: "Can Özkan",
      phone: "(555) 456-7890",
      staff: "Çalışan",
      service: "Saç Kesimi",
      price: 35,
      status: "confirmed",
      notes: "",
    },
    {
      id: 5,
      date: "2024-01-14",
      time: "16:00",
      endTime: "16:45",
      customer: "Emre Şahin",
      phone: "(555) 567-8901",
      staff: "Berber",
      service: "Saç + Sakal",
      price: 50,
      status: "completed",
      notes: "Memnun kaldı",
    },
    {
      id: 6,
      date: "2024-01-13",
      time: "18:30",
      endTime: "19:15",
      customer: "Oğuz Kaya",
      phone: "(555) 678-9012",
      staff: "Çalışan",
      service: "Saç Kesimi",
      price: 35,
      status: "cancelled",
      notes: "Müşteri iptal etti",
    },
  ]);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStaff =
      selectedStaff === "all" || appointment.staff === selectedStaff;
    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;
    const matchesDate = !selectedDate || appointment.date === selectedDate;

    return matchesSearch && matchesStaff && matchesStatus && matchesDate;
  });

  // Group appointments by status
  const upcomingAppointments = filteredAppointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending"
  );
  const completedAppointments = filteredAppointments.filter(
    (apt) => apt.status === "completed"
  );
  const cancelledAppointments = filteredAppointments.filter(
    (apt) => apt.status === "cancelled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStaffColor = (staff: string) => {
    return staff === "Berber" ? "text-blue-600" : "text-green-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    setShowDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card
      key={appointment.id}
      className="mb-4 hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status === "confirmed" && "Onaylandı"}
              {appointment.status === "pending" && "Bekliyor"}
              {appointment.status === "completed" && "Tamamlandı"}
              {appointment.status === "cancelled" && "İptal"}
            </Badge>
            <span
              className={`font-semibold text-lg ${getStaffColor(
                appointment.staff
              )}`}
            >
              {appointment.staff}
            </span>
          </div>
          <span className="font-bold text-xl text-gray-900">
            {appointment.price}₺
          </span>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-3 text-gray-400" />
              <span className="font-semibold text-lg">
                {appointment.customer}
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-gray-600">{appointment.phone}</span>
            </div>
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
                {appointment.time} - {appointment.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900">{appointment.service}</p>
            {appointment.notes && (
              <p className="text-sm text-gray-600 mt-1">
                Not: {appointment.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <Eye className="w-4 h-4 mr-2" />
            Detaylar
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <Phone className="w-4 h-4 mr-2" />
            Ara
          </Button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/barber">
              <Button variant="ghost" size="sm" className="text-base">
                <ArrowLeft className="w-5 h-5 mr-2" />
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
          <Button
            size="sm"
            className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Randevu
          </Button>
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
                    placeholder="Müşteri adı, telefon veya hizmet ara..."
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
                  <SelectItem value="Berber">Berber</SelectItem>
                  <SelectItem value="Çalışan">Çalışan</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
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
                {filteredAppointments.reduce((sum, apt) => sum + apt.price, 0)}₺
              </div>
              <div className="text-sm text-gray-600">Toplam Gelir</div>
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
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Randevu
                  </Button>
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
