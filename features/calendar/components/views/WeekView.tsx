"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCell } from "../cells/AppointmentCell";
import { EmptySlot } from "../cells/EmptySlot";
import { WeekViewProps } from '../../types/calendar.types';
import { CalendarService } from '../../services/calendarService';

export function WeekView({ 
  currentDate, 
  appointments, 
  staffMembers, 
  onAppointmentClick, 
  onTimeSlotClick 
}: WeekViewProps) {
  const { startDate, endDate } = CalendarService.getDateRange(currentDate, 'week');
  const timeSlots = CalendarService.generateTimeSlots();
  const weekDays = CalendarService.getWeekDays();
  
  // Generate week days
  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getAppointmentForSlot = (date: Date, time: string, staffId: string) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.find(apt => 
      apt.date === dateString && 
      apt.startTime === time && 
      apt.staff.id === staffId
    );
  };

  const isSlotAvailable = (date: Date, time: string, staffId: string) => {
    const dateString = date.toISOString().split('T')[0];
    return CalendarService.isTimeSlotAvailable(dateString, time, staffId, appointments);
  };

  const isToday = (date: Date) => CalendarService.isSameDay(date, new Date());

  return (
    <div className="h-full">
      {/* Week Header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold">
          {CalendarService.formatDateForDisplay(startDate, 'week')} Haftası
        </h2>
        <p className="text-sm text-gray-600">
          {appointments.length} randevu planlanmış
        </p>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 gap-4">
        {staffMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Personel bulunamadı
            </CardContent>
          </Card>
        ) : (
          staffMembers.map((staff) => (
            <Card key={staff.id} className="overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-medium">
                  {staff.firstName} {staff.lastName}
                </h3>
                <p className="text-sm text-gray-600">{staff.role}</p>
              </div>
              
              <ScrollArea className="h-96">
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 gap-1 p-2 bg-gray-100 sticky top-0">
                      <div className="p-2 text-xs font-medium text-gray-600">Saat</div>
                      {days.map((day, index) => (
                        <div 
                          key={index} 
                          className={`p-2 text-xs font-medium text-center ${
                            isToday(day) ? 'bg-blue-100 text-blue-800 rounded' : 'text-gray-600'
                          }`}
                        >
                          <div>{weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1]}</div>
                          <div className="text-lg font-bold">{day.getDate()}</div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-8 gap-1 p-2 border-t">
                        <div className="p-2 text-xs font-medium text-gray-600 flex items-center">
                          {time}
                        </div>
                        {days.map((day, dayIndex) => {
                          const appointment = getAppointmentForSlot(day, time, staff.id);
                          const available = isSlotAvailable(day, time, staff.id);
                          const dateString = day.toISOString().split('T')[0];

                          return (
                            <div key={dayIndex} className="min-h-12">
                              {appointment ? (
                                <AppointmentCell
                                  appointment={appointment}
                                  onClick={onAppointmentClick}
                                />
                              ) : (
                                <EmptySlot
                                  time={time}
                                  staffId={staff.id}
                                  available={available}
                                  onClick={(t, sId) => onTimeSlotClick?.(dateString, t, sId)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}