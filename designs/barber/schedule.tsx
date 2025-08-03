"use client";
// done
import { useState } from "react";
import { ArrowLeft, Clock, Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function BarberSchedule() {
  // Time blocking state
  const [blockDate, setBlockDate] = useState("");
  const [blockStaff, setBlockStaff] = useState("");
  const [blockType, setBlockType] = useState("time-range");
  const [blockStartTime, setBlockStartTime] = useState("");
  const [blockEndTime, setBlockEndTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<number | null>(null);

  // Working hours state
  const [appointmentDuration, setAppointmentDuration] = useState(45);
  const [reservationDays, setReservationDays] = useState(7);
  const [cancellationHours, setCancellationHours] = useState(2);

  const [workingHours, setWorkingHours] = useState({
    monday: { isOpen: true, start: "09:30", end: "21:30" },
    tuesday: { isOpen: true, start: "09:30", end: "21:30" },
    wednesday: { isOpen: true, start: "09:30", end: "21:30" },
    thursday: { isOpen: true, start: "09:30", end: "21:30" },
    friday: { isOpen: true, start: "09:30", end: "21:30" },
    saturday: { isOpen: true, start: "09:30", end: "21:30" },
    sunday: { isOpen: false, start: "09:30", end: "21:30" },
  });

  // Mock blocked times
  const [blockedTimes, setBlockedTimes] = useState([
    {
      id: 1,
      date: "2024-01-20",
      staff: "Berber",
      startTime: "12:30",
      endTime: "13:15",
      reason: "Öğle molası",
      type: "time-range",
    },
    {
      id: 2,
      date: "2024-01-22",
      staff: "Çalışan",
      startTime: "13:30",
      endTime: "14:15",
      reason: "Kişisel işler",
      type: "time-range",
    },
  ]);

  const dayNames = {
    monday: "Pazartesi",
    tuesday: "Salı",
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
    sunday: "Pazar",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  const handleAddTimeBlock = () => {
    if (
      !blockDate ||
      !blockStaff ||
      !blockStartTime ||
      !blockEndTime ||
      !blockReason
    ) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    const newBlock = {
      id: Date.now(),
      date: blockDate,
      staff: blockStaff,
      startTime: blockStartTime,
      endTime: blockEndTime,
      reason: blockReason,
      type: blockType,
    };

    setBlockedTimes([...blockedTimes, newBlock]);

    // Reset form
    setBlockDate("");
    setBlockStaff("");
    setBlockStartTime("");
    setBlockEndTime("");
    setBlockReason("");
  };

  const handleDeleteTimeBlock = (id: number) => {
    setBlockedTimes(blockedTimes.filter((block) => block.id !== id));
    setShowDeleteDialog(false);
    setBlockToDelete(null);
  };

  const handleWorkingHourChange = (day: string, field: string, value: any) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const resetToDefaults = () => {
    setWorkingHours({
      monday: { isOpen: true, start: "09:30", end: "21:30" },
      tuesday: { isOpen: true, start: "09:30", end: "21:30" },
      wednesday: { isOpen: true, start: "09:30", end: "21:30" },
      thursday: { isOpen: true, start: "09:30", end: "21:30" },
      friday: { isOpen: true, start: "09:30", end: "21:30" },
      saturday: { isOpen: true, start: "09:30", end: "21:30" },
      sunday: { isOpen: false, start: "09:30", end: "21:30" },
    });
    setAppointmentDuration(45);
    setReservationDays(7);
    setCancellationHours(2);
  };

  const handleSave = () => {
    // Here you would save to your backend
    alert("Ayarlar kaydedildi!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center">
          <Link href="/barber">
            <Button variant="ghost" size="sm" className="text-base">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Zaman Yönetimi
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Çalışma saatleri ve müsaitlik ayarları
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Blocking Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Zaman Bloklama
              </CardTitle>
              <p className="text-sm text-gray-600">
                Belirli tarih ve saatlerde randevu alınmasını engelleyin.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label htmlFor="block-date" className="text-sm font-medium">
                  Tarih
                </Label>
                <Input
                  id="block-date"
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Staff Selection */}
              <div>
                <Label className="text-sm font-medium">Personel</Label>
                <Select value={blockStaff} onValueChange={setBlockStaff}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berber">Berber</SelectItem>
                    <SelectItem value="Çalışan">Çalışan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Block Type */}
              <div>
                <Label className="text-sm font-medium">Blok Türü</Label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant={blockType === "full-day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlockType("full-day")}
                    className="flex-1"
                  >
                    Tüm Gün
                  </Button>
                  <Button
                    variant={blockType === "time-range" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlockType("time-range")}
                    className="flex-1"
                  >
                    Saat Aralığı
                  </Button>
                </div>
              </div>

              {/* Time Range (only show if time-range is selected) */}
              {blockType === "time-range" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-sm font-medium">
                      Başlangıç Saati
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm font-medium">
                      Bitiş Saati
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Sebep
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Zaman bloklama sebebi..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="mt-1 h-20"
                />
              </div>

              {/* Add Button */}
              <Button
                onClick={handleAddTimeBlock}
                className="w-full bg-black hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Zaman Bloğu Ekle
              </Button>
            </CardContent>
          </Card>

          {/* Working Hours Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Çalışma Saatleri
              </CardTitle>
              <p className="text-sm text-gray-600">
                Genel çalışma saatlerinizi ve kapalı günleri ayarlayın.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Randevu Süresi
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {appointmentDuration}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">dakika</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Rezervasyon Süresi
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {reservationDays}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      gün önceden
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    İptal Sınırı
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {cancellationHours}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      saat önce
                    </span>
                  </div>
                </div>
              </div>

              {/* Daily Working Hours */}
              <div className="space-y-4">
                {Object.entries(dayNames).map(([key, dayName]) => {
                  const dayData =
                    workingHours[key as keyof typeof workingHours];
                  return (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between sm:justify-start mb-2 sm:mb-0">
                        <span className="font-medium text-gray-900 mr-4">
                          {dayName}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={dayData.isOpen}
                            onCheckedChange={(checked) =>
                              handleWorkingHourChange(key, "isOpen", checked)
                            }
                          />
                          <Badge
                            variant={dayData.isOpen ? "default" : "secondary"}
                          >
                            {dayData.isOpen ? "Açık" : "Kapalı"}
                          </Badge>
                        </div>
                      </div>

                      {dayData.isOpen && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-600">
                            Başlangıç:
                          </Label>
                          <Input
                            type="time"
                            value={dayData.start}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                key,
                                "start",
                                e.target.value
                              )
                            }
                            className="w-24"
                          />
                          <Label className="text-sm text-gray-600">
                            Bitiş:
                          </Label>
                          <Input
                            type="time"
                            value={dayData.end}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                key,
                                "end",
                                e.target.value
                              )
                            }
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  className="flex-1 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Varsayılana Dön
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-black hover:bg-gray-800"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Zaman Bloğunu Sil</DialogTitle>
              <DialogDescription>
                Bu zaman bloğunu silmek istediğinizden emin misiniz? Bu işlem
                geri alınamaz.
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
                  blockToDelete && handleDeleteTimeBlock(blockToDelete)
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
