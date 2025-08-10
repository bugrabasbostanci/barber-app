"use client";

import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { CalendarTimeSlot } from "../types";
import { AppointmentCard } from "./AppointmentCard";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  timeSlot: CalendarTimeSlot;
  onAppointmentClick?: (appointment: NonNullable<CalendarTimeSlot['appointment']>) => void;
  onCreateAppointment?: (time: string) => void;
  className?: string;
}

export function TimeSlot({
  timeSlot,
  onAppointmentClick,
  onCreateAppointment,
  className = ""
}: TimeSlotProps) {
  const { time, isAvailable, appointment } = timeSlot;

  if (appointment && !['CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
    return (
      <div className={cn("min-h-[60px] border-b border-muted", className)}>
        <div className="flex items-center gap-3 p-2">
          <div className="w-12 text-xs text-muted-foreground font-mono">
            {time}
          </div>
          <div className="flex-1">
            <AppointmentCard
              appointment={appointment}
              compact
              onClick={() => appointment && onAppointmentClick?.(appointment)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-[60px] border-b border-muted group hover:bg-muted/30 transition-colors",
      className
    )}>
      <div className="flex items-center gap-3 p-2">
        <div className="w-12 text-xs text-muted-foreground font-mono">
          {time}
        </div>
        
        <div className="flex-1">
          {isAvailable ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCreateAppointment?.(time)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Randevu Ekle
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              {appointment ? (
                <span>İptal edilmiş randevu</span>
              ) : (
                <span>Müsait değil</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}