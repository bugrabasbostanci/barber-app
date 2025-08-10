"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDate, CalendarAppointment } from "../types";
import { AppointmentCard } from "./AppointmentCard";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  weekData: CalendarDate[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onCreateAppointment?: (date: Date, time?: string) => void;
  className?: string;
}

const dayNames = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 
  'Perşembe', 'Cuma', 'Cumartesi'
];

export function WeekView({
  weekData,
  onAppointmentClick,
  onCreateAppointment,
  className = ""
}: WeekViewProps) {
  const handleDayClick = (date: CalendarDate) => {
    onCreateAppointment?.(date.date);
  };

  return (
    <div className={cn("grid grid-cols-7 gap-2", className)}>
      {weekData.map((day, index) => {
        const isClosed = day.date.getDay() === 0; // Sunday
        const activeAppointments = day.appointments.filter(apt => 
          !['CANCELLED', 'NO_SHOW'].includes(apt.status)
        );

        return (
          <Card 
            key={`${day.year}-${day.month}-${day.day}`}
            className={cn(
              "h-80 cursor-pointer transition-colors hover:bg-muted/30",
              day.isToday && "ring-2 ring-primary",
              !day.isCurrentMonth && "opacity-60",
              isClosed && "bg-muted/20"
            )}
            onClick={() => handleDayClick(day)}
          >
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {dayNames[index]}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-lg font-bold",
                    day.isToday && "text-primary"
                  )}>
                    {day.day}
                  </span>
                  {day.isToday && (
                    <Badge variant="secondary" className="text-xs px-1">
                      Bugün
                    </Badge>
                  )}
                </div>
              </div>
              
              {activeAppointments.length > 0 && (
                <Badge variant="outline" className="text-xs w-fit">
                  {activeAppointments.length} randevu
                </Badge>
              )}
              
              {isClosed && (
                <Badge variant="destructive" className="text-xs w-fit">
                  Kapalı
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-3 pt-0">
              {isClosed ? (
                <div className="text-center text-muted-foreground text-xs">
                  Pazar günü kapalı
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {day.appointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        compact
                        onClick={(apt) => onAppointmentClick?.(apt)}
                      />
                    ))}
                    
                    {day.appointments.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        Randevu yok
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}