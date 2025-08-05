"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MonthViewProps } from '../../types/calendar.types';
import { CalendarService } from '../../services/calendarService';
import { cn } from "@/lib/utils";

export function MonthView({ 
  currentDate, 
  appointments, 
  onDateClick, 
  onAppointmentClick 
}: MonthViewProps) {
  const weeks = CalendarService.generateCalendarWeeks(currentDate, appointments);
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const today = new Date();

  const getAppointmentCount = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString).length;
  };

  const getStatusCounts = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(apt => apt.date === dateString);
    
    return {
      confirmed: dayAppointments.filter(apt => apt.status === 'confirmed').length,
      pending: dayAppointments.filter(apt => apt.status === 'pending').length,
      cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length,
    };
  };

  const isToday = (date: Date) => CalendarService.isSameDay(date, today);
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className="h-full">
      {/* Month Header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold">
          {CalendarService.formatDateForDisplay(currentDate, 'month')}
        </h2>
        <p className="text-sm text-gray-600">
          {appointments.length} randevu bu ay
        </p>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Weeks */}
          <div className="space-y-1">
            {weeks.map((week) => (
              <div key={week.weekNumber} className="grid grid-cols-7 gap-1">
                {week.days.map((day) => {
                  const appointmentCount = getAppointmentCount(day.date);
                  const statusCounts = getStatusCounts(day.date);
                  const hasAppointments = appointmentCount > 0;

                  return (
                    <div
                      key={day.dateString}
                      className={cn(
                        "p-2 min-h-24 border rounded-lg cursor-pointer transition-colors",
                        "hover:bg-gray-50",
                        isToday(day.date) && "bg-blue-50 border-blue-300",
                        !isCurrentMonth(day.date) && "text-gray-400 bg-gray-50",
                        hasAppointments && "border-l-4 border-l-blue-500"
                      )}
                      onClick={() => onDateClick(day.date)}
                    >
                      {/* Day Number */}
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isToday(day.date) && "text-blue-600"
                      )}>
                        {day.date.getDate()}
                      </div>

                      {/* Appointments Summary */}
                      {hasAppointments && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            {appointmentCount} randevu
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-1">
                            {statusCounts.confirmed > 0 && (
                              <Badge 
                                variant="default" 
                                className="text-xs px-1 py-0 bg-green-100 text-green-800"
                              >
                                {statusCounts.confirmed}
                              </Badge>
                            )}
                            {statusCounts.pending > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-1 py-0 bg-yellow-100 text-yellow-800"
                              >
                                {statusCounts.pending}
                              </Badge>
                            )}
                            {statusCounts.cancelled > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="text-xs px-1 py-0"
                              >
                                {statusCounts.cancelled}
                              </Badge>
                            )}
                          </div>

                          {/* First Few Appointments */}
                          <div className="space-y-0.5">
                            {day.appointments.slice(0, 2).map((appointment) => (
                              <div
                                key={appointment.id}
                                className="text-xs p-1 bg-blue-100 rounded text-blue-800 cursor-pointer hover:bg-blue-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAppointmentClick?.(appointment);
                                }}
                              >
                                {appointment.startTime} - {
                                  appointment.customer
                                    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                    : appointment.manualCustomerName
                                }
                              </div>
                            ))}
                            
                            {day.appointments.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{day.appointments.length - 2} daha
                              </div>
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
    </div>
  );
}