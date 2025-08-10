"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarMonth, CalendarAppointment } from "../types";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  monthData: CalendarMonth;
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  className?: string;
}

const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export function MonthView({
  monthData,
  onDateClick,
  onAppointmentClick,
  className = ""
}: MonthViewProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {monthData.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.days.map((day) => {
                const isClosed = day.date.getDay() === 0; // Sunday
                const activeAppointments = day.appointments.filter(apt => 
                  !['CANCELLED', 'NO_SHOW'].includes(apt.status)
                );
                const hasAppointments = activeAppointments.length > 0;

                return (
                  <div
                    key={`${day.year}-${day.month}-${day.day}`}
                    className={cn(
                      "min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors hover:bg-muted/30",
                      day.isToday && "bg-primary/10 border-primary",
                      !day.isCurrentMonth && "opacity-40 bg-muted/20",
                      isClosed && "bg-red-50 border-red-200"
                    )}
                    onClick={() => onDateClick?.(day.date)}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        day.isToday && "text-primary font-bold",
                        !day.isCurrentMonth && "text-muted-foreground"
                      )}>
                        {day.day}
                      </span>
                      
                      {day.isToday && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          Bugün
                        </Badge>
                      )}
                    </div>

                    {/* Closed indicator */}
                    {isClosed && (
                      <Badge variant="destructive" className="text-xs px-1 py-0 h-4 mb-1">
                        Kapalı
                      </Badge>
                    )}

                    {/* Appointments */}
                    {!isClosed && (
                      <div className="space-y-1">
                        {hasAppointments && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                            {activeAppointments.length}
                          </Badge>
                        )}
                        
                        {/* Show first few appointments as dots */}
                        <div className="flex flex-wrap gap-0.5">
                          {activeAppointments.slice(0, 4).map((appointment, index) => (
                            <div
                              key={appointment.id}
                              className={cn(
                                "w-2 h-2 rounded-full cursor-pointer",
                                appointment.status === 'CONFIRMED' && "bg-green-500",
                                appointment.status === 'SCHEDULED' && "bg-blue-500",
                                appointment.status === 'COMPLETED' && "bg-gray-400",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentClick?.(appointment);
                              }}
                              title={`${appointment.startTime} - ${appointment.customer?.firstName || appointment.manualCustomerName || 'Müşteri'}`}
                            />
                          ))}
                          
                          {activeAppointments.length > 4 && (
                            <div 
                              className="w-2 h-2 rounded-full bg-muted-foreground"
                              title={`+${activeAppointments.length - 4} randevu daha`}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}