"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Calendar,
} from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BUSINESS_RULES } from "@/lib/constants";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function BarberSchedule() {
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

  // Time blocking state
  const [blockDate, setBlockDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [blockStaff, setBlockStaff] = useState("");
  const [blockType, setBlockType] = useState("time-range");
  const [blockStartTime, setBlockStartTime] = useState("");
  const [blockEndTime, setBlockEndTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  // Working hours state - using BUSINESS_RULES
  const [appointmentDuration, setAppointmentDuration] = useState(
    BUSINESS_RULES.APPOINTMENT_DURATION
  );
  const [reservationDays, setReservationDays] = useState(
    BUSINESS_RULES.BOOKING_WINDOW_DAYS
  );
  const [cancellationHours, setCancellationHours] = useState(
    BUSINESS_RULES.CANCELLATION_HOURS
  );

  const [workingHours, setWorkingHours] = useState({
    monday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    tuesday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    wednesday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    thursday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    friday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    saturday: {
      isOpen: true,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
    sunday: {
      isOpen: false,
      start: BUSINESS_RULES.WORKING_HOURS.start,
      end: BUSINESS_RULES.WORKING_HOURS.end,
    },
  });

  // Data states
  const [blockedTimes, setBlockedTimes] = useState<
    {
      id: string;
      date: string;
      startTime?: string | null;
      endTime?: string | null;
      reason: string;
      isFullDay: boolean;
      staffId: string;
      staff?: { firstName: string; lastName: string };
    }[]
  >([]);
  const [staffMembers, setStaffMembers] = useState<
    {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff members
        const staffResponse = await fetch("/api/staff");
        if (staffResponse.ok) {
          const staffResult = await staffResponse.json();
          if (staffResult.success && Array.isArray(staffResult.data)) {
            setStaffMembers(staffResult.data);
          }
        }

        // Fetch blocked times
        const blocksResponse = await fetch("/api/time-blocks");
        if (blocksResponse.ok) {
          const blocksResult = await blocksResponse.json();
          if (blocksResult.success && Array.isArray(blocksResult.data)) {
            setBlockedTimes(blocksResult.data);
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
    return formatTurkishDate(dateString);
  };

  const handleAddTimeBlock = async () => {
    if (!blockDate || !blockStaff || !blockReason) {
      alert("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    if (blockType === "time-range" && (!blockStartTime || !blockEndTime)) {
      alert("Lütfen başlangıç ve bitiş saatini seçin");
      return;
    }

    try {
      const response = await fetch("/api/time-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: blockDate ? dateToLocalString(blockDate) : "",
          staffId: blockStaff,
          startTime: blockType === "full-day" ? null : blockStartTime,
          endTime: blockType === "full-day" ? null : blockEndTime,
          reason: blockReason,
          isFullDay: blockType === "full-day",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Add to local state
        setBlockedTimes((prev) => [...prev, result.timeBlock]);

        // Reset form
        setBlockDate(undefined);
        setBlockStaff("");
        setBlockStartTime("");
        setBlockEndTime("");
        setBlockReason("");
        setBlockType("time-range");

        alert("Zaman bloğu başarıyla oluşturuldu!");
      } else {
        alert(result.error || "Zaman bloğu oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error creating time block:", error);
      alert(
        "Zaman bloğu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const handleDeleteTimeBlock = async (id: string) => {
    if (!confirm("Bu zaman bloğunu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/time-blocks/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBlockedTimes((prev) => prev.filter((block) => block.id !== id));
        setShowDeleteDialog(false);
        setBlockToDelete(null);
        alert("Zaman bloğu başarıyla silindi!");
      } else {
        alert(result.error || "Zaman bloğu silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting time block:", error);
      alert("Zaman bloğu silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleWorkingHourChange = (
    day: string,
    field: string,
    value: boolean | string
  ) => {
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
      monday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      tuesday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      wednesday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      thursday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      friday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      saturday: {
        isOpen: true,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
      sunday: {
        isOpen: false,
        start: BUSINESS_RULES.WORKING_HOURS.start,
        end: BUSINESS_RULES.WORKING_HOURS.end,
      },
    });
    setAppointmentDuration(BUSINESS_RULES.APPOINTMENT_DURATION);
    setReservationDays(BUSINESS_RULES.BOOKING_WINDOW_DAYS);
    setCancellationHours(BUSINESS_RULES.CANCELLATION_HOURS);
  };

  const handleSave = async () => {
    // TODO: Integrate with API
    alert("Ayarlar kaydedildi!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center">
          <Link href="/barber/dashboard">
            <Button variant="ghost" size="lg" className="text-base">
              <ArrowLeft className="w-6 h-6 mr-3" />
              Geri
            </Button>
          </Link>
          <div className="ml-6">
            <h1 className="text-xl sm:text-2xl font-bold">
              Zaman Yönetimi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
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
              <p className="text-sm text-muted-foreground">
                Belirli tarih ve saatlerde randevu alınmasını engelleyin.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium">Tarih</Label>
                <div className="mt-1">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !blockDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {blockDate ? (
                          formatTurkishDate(dateToLocalString(blockDate))
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={blockDate}
                        onSelect={(date) => {
                          setBlockDate(date);
                          setCalendarOpen(false);
                        }}
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        locale={tr}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Staff Selection */}
              <div>
                <Label className="text-sm font-medium">Personel</Label>
                <Select value={blockStaff} onValueChange={setBlockStaff}>
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        loading ? "Personeller yükleniyor..." : "Personel seçin"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Yükleniyor...
                      </SelectItem>
                    ) : staffMembers.length === 0 ? (
                      <SelectItem value="no-staff" disabled>
                        Personel bulunamadı
                      </SelectItem>
                    ) : (
                      staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName}
                        </SelectItem>
                      ))
                    )}
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
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="start-time"
                      className="text-sm font-medium px-1"
                    >
                      Başlangıç Saati
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      step="900"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-10"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="end-time"
                      className="text-sm font-medium px-1"
                    >
                      Bitiş Saati
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      step="900"
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-10"
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
                className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Zaman Bloğu Ekle
              </Button>

              {/* Blocked Times List */}
              {blockedTimes.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">
                    Bloklanmış Zamanlar:
                  </h4>
                  {blockedTimes.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {formatDate(block.date)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">
                            {block.staff
                              ? `${block.staff.firstName} ${block.staff.lastName}`
                              : "Bilinmeyen"}
                          </span>
                          {block.isFullDay ? (
                            <span> - Tüm gün</span>
                          ) : (
                            <span>
                              {" "}
                              - {block.startTime} / {block.endTime}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {block.reason}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBlockToDelete(block.id);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Working Hours Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Çalışma Saatleri
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Genel çalışma saatlerinizi ve kapalı günleri ayarlayın.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">
                    Randevu Süresi
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {appointmentDuration}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">dakika</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Rezervasyon Süresi
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {reservationDays}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      gün önceden
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    İptal Sınırı
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">
                      {cancellationHours}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
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
                        <span className="font-medium mr-4">
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
                          <Label className="text-sm text-muted-foreground">
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
                            step="900"
                            className="w-24 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                          <Label className="text-sm text-muted-foreground">
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
                            step="900"
                            className="w-24 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
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
                  className="flex-1 bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
