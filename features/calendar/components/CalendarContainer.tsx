"use client";

import { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { useCalendarData } from '../hooks/useCalendarData';
import { type Appointment } from '@/features/appointments';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarService } from '../services/calendarService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CalendarContainer() {
  const {
    currentDate,
    viewType,
    appointments,
    staffMembers,
    loading,
    error,
    navigateDate,
    goToToday,
    goToDate,
    changeViewType,
    getFormattedDateString,
  } = useCalendarData();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: string, time: string, staffId?: string) => {
    // Handle time slot click - could navigate to booking form
    console.log('Time slot clicked:', { date, time, staffId });
  };

  const handleDayViewTimeSlotClick = (time: string, staffId?: string) => {
    const dateString = currentDate.toISOString().split('T')[0];
    handleTimeSlotClick(dateString, time, staffId);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Takvim yüklenirken bir hata oluştu:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CalendarHeader
          currentDate={currentDate}
          viewType={viewType}
          onPrevious={() => navigateDate('prev')}
          onNext={() => navigateDate('next')}
          onToday={goToToday}
          onViewTypeChange={changeViewType}
        />
        
        <CardContent className="p-4">
          {/* Calendar Views */}
          <div className="min-h-[400px]">
            {viewType === 'day' && (
              <DayView
                date={currentDate}
                appointments={appointments}
                staffMembers={staffMembers}
                onAppointmentClick={handleAppointmentClick}
                onTimeSlotClick={handleDayViewTimeSlotClick}
              />
            )}
            {viewType === 'week' && (
              <WeekView
                currentDate={currentDate}
                appointments={appointments}
                staffMembers={staffMembers}
                onAppointmentClick={handleAppointmentClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            )}
            {viewType === 'month' && (
              <MonthView
                currentDate={currentDate}
                appointments={appointments}
                onDateClick={goToDate}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
          </div>

          {/* Summary section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Özet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Toplam Randevu:</span>
                <span className="ml-2 font-medium">{appointments.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Aktif Personel:</span>
                <span className="ml-2 font-medium">{staffMembers.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Görünüm:</span>
                <span className="ml-2 font-medium">
                  {viewType === 'day' ? 'Günlük' : viewType === 'week' ? 'Haftalık' : 'Aylık'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevu Detayları</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Müşteri</label>
                <p className="text-sm">
                  {selectedAppointment.customer
                    ? `${selectedAppointment.customer.firstName} ${selectedAppointment.customer.lastName}`
                    : selectedAppointment.manualCustomerName || 'Bilinmeyen Müşteri'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Telefon</label>
                <p className="text-sm">
                  {selectedAppointment.customer?.phone || 
                   selectedAppointment.manualCustomerPhone || 
                   'Belirtilmemiş'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Berber</label>
                <p className="text-sm">
                  {`${selectedAppointment.staff.firstName} ${selectedAppointment.staff.lastName}`}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tarih</label>
                  <p className="text-sm">{selectedAppointment.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Saat</label>
                  <p className="text-sm">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Durum</label>
                <p className="text-sm">{selectedAppointment.status}</p>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notlar</label>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}