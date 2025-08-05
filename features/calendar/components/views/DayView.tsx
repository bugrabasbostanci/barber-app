"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCell } from "../cells/AppointmentCell";
import { EmptySlot } from "../cells/EmptySlot";
import { DayViewProps } from '../../types/calendar.types';
import { CalendarService } from '../../services/calendarService';

export function DayView({ 
  date, 
  appointments, 
  staffMembers, 
  onAppointmentClick, 
  onTimeSlotClick 
}: DayViewProps) {
  const timeSlots = CalendarService.generateTimeSlots();
  const dateString = date.toISOString().split('T')[0];

  const getAppointmentForSlot = (time: string, staffId: string) => {
    return appointments.find(apt => 
      apt.date === dateString && 
      apt.startTime === time && 
      apt.staff.id === staffId
    );
  };

  const isSlotAvailable = (time: string, staffId: string) => {
    return CalendarService.isTimeSlotAvailable(dateString, time, staffId, appointments);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold">
          {CalendarService.formatDateForDisplay(date, 'day')}
        </h2>
        <p className="text-sm text-gray-600">
          {appointments.length} randevu planlanmış
        </p>
      </div>

      {/* Day Grid */}
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
                <div className="p-2 space-y-1">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForSlot(time, staff.id);
                    const available = isSlotAvailable(time, staff.id);

                    return (
                      <div key={time} className="relative">
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
                            onClick={onTimeSlotClick}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}