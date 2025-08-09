import { useState } from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { dateToLocalString, formatTurkishDateShort } from "@/lib/date-time";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface AppointmentsFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedStaff: string;
  onSelectedStaffChange: (staff: string) => void;
  selectedStatus: string;
  onSelectedStatusChange: (status: string) => void;
  selectedDate: Date | undefined;
  onSelectedDateChange: (date: Date | undefined) => void;
  staffMembers: StaffMember[];
}

export function AppointmentsFilters({
  searchTerm,
  onSearchTermChange,
  selectedStaff,
  onSelectedStaffChange,
  selectedStatus,
  onSelectedStatusChange,
  selectedDate,
  onSelectedDateChange,
  staffMembers,
}: AppointmentsFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Filtreler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri adı veya telefon ara..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedStaff} onValueChange={onSelectedStaffChange}>
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

          <Select value={selectedStatus} onValueChange={onSelectedStatusChange}>
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

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  formatTurkishDateShort(dateToLocalString(selectedDate))
                ) : (
                  <span>Tarih seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  onSelectedDateChange(date);
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
                      onSelectedDateChange(undefined);
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
  );
}