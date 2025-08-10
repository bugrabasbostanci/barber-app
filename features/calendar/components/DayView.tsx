"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarDayData, CalendarAppointment } from "../types";
import { TimeSlot } from "./TimeSlot";
import { cn } from "@/lib/utils";

interface DayViewProps {
  dayData: CalendarDayData;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onCreateAppointment?: (date: Date, time: string) => void;
  className?: string;
}

export function DayView({
  dayData,
  onAppointmentClick,
  onCreateAppointment,
  className = ""
}: DayViewProps) {
  const { date, timeSlots, appointments } = dayData;
  
  const isToday = date.toDateString() === new Date().toDateString();
  const isClosed = date.getDay() === 0; // Sunday
  
  const activeAppointments = appointments.filter(apt => 
    !['CANCELLED', 'NO_SHOW'].includes(apt.status)
  );

  const handleCreateAppointment = (time: string) => {
    onCreateAppointment?.(date, time);
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {date.toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isToday && (
              <Badge variant="secondary">Bugün</Badge>
            )}
            {isClosed && (
              <Badge variant="destructive">Kapalı</Badge>
            )}
            <Badge variant="outline">
              {activeAppointments.length} Randevu
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isClosed ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Pazar günü kapalı</p>
              <p className="text-sm">Randevu alınamaz</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-0">
              {timeSlots.map((timeSlot) => (
                <TimeSlot
                  key={timeSlot.time}
                  timeSlot={timeSlot}
                  onAppointmentClick={onAppointmentClick}
                  onCreateAppointment={handleCreateAppointment}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}