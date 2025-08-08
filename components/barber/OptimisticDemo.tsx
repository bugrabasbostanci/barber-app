"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOptimisticUpdates, useOptimisticFeedback } from '@/hooks/queries/barber/useOptimisticUpdates';
import { 
  useUpdateAppointmentStatus, 
  useBulkUpdateAppointmentStatus,
  useBarberAppointments 
} from '@/hooks/queries/barber/useBarberAppointments';
import { 
  useCreateTimeBlock,
  useDeleteTimeBlock,
  useToggleAvailability,
  useTimeBlocks 
} from '@/hooks/queries/barber/useBarberAvailability';

export function OptimisticDemo() {
  const [testMode, setTestMode] = useState<'appointment' | 'availability'>('appointment');
  const { data: appointments = [], isLoading: appointmentsLoading } = useBarberAppointments();
  const { data: timeBlocks = [], isLoading: availabilityLoading } = useTimeBlocks();
  
  const { 
    getPendingCount, 
    getOperationsByType
  } = useOptimisticUpdates();
  
  const { showOptimisticFeedback } = useOptimisticFeedback();
  
  const updateAppointmentStatus = useUpdateAppointmentStatus();
  const bulkUpdateStatus = useBulkUpdateAppointmentStatus();
  const createTimeBlock = useCreateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();
  const toggleAvailability = useToggleAvailability();

  const pendingCount = getPendingCount();
  const pendingAppointments = getOperationsByType('appointment').length;
  const pendingAvailability = getOperationsByType('availability').length;

  // Test appointment status update
  const handleAppointmentStatusUpdate = async (appointmentId: string, newStatus: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => {
    try {
      await updateAppointmentStatus.mutateAsync({ 
        id: appointmentId, 
        status: newStatus 
      });
      showOptimisticFeedback(`Randevu durumu ${newStatus} olarak güncellendi`, 'success');
    } catch {
      showOptimisticFeedback('Randevu güncelleme başarısız', 'warning');
    }
  };

  // Test bulk status update
  const handleBulkStatusUpdate = async (appointmentIds: string[], newStatus: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => {
    try {
      await bulkUpdateStatus.mutateAsync({ 
        ids: appointmentIds, 
        status: newStatus 
      });
      showOptimisticFeedback(`${appointmentIds.length} randevu toplu güncellendi`, 'success');
    } catch {
      showOptimisticFeedback('Toplu güncelleme başarısız', 'warning');
    }
  };

  // Test availability toggle
  const handleAvailabilityToggle = async (date: string, staffId: string, isBlocking: boolean) => {
    try {
      await toggleAvailability.mutateAsync({ date, staffId, isBlocking });
      showOptimisticFeedback(
        isBlocking ? 'Tarih bloklandı' : 'Tarih bloğu kaldırıldı', 
        'success'
      );
    } catch {
      showOptimisticFeedback('Müsaitlik güncelleme başarısız', 'warning');
    }
  };

  // Test time block creation
  const handleCreateTimeBlock = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await createTimeBlock.mutateAsync({
        date: today,
        staffId: 'test-staff-id',
        reason: 'Test bloğu',
        isFullDay: false,
        startTime: '10:00',
        endTime: '12:00',
      });
      showOptimisticFeedback('Zaman bloğu oluşturuldu', 'success');
    } catch {
      showOptimisticFeedback('Zaman bloğu oluşturma başarısız', 'warning');
    }
  };

  if (appointmentsLoading || availabilityLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Optimistic Updates Testi</CardTitle>
        <CardDescription>
          Optimistic update fonksiyonlarını test edin. Değişiklikler anında görülür, hata durumunda geri alınır.
        </CardDescription>
        
        <div className="flex gap-2 items-center">
          <Badge variant={pendingCount > 0 ? "default" : "outline"}>
            {pendingCount} işlem bekliyor
          </Badge>
          {pendingAppointments > 0 && (
            <Badge variant="secondary">
              {pendingAppointments} randevu
            </Badge>
          )}
          {pendingAvailability > 0 && (
            <Badge variant="secondary">
              {pendingAvailability} müsaitlik
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={testMode === 'appointment' ? 'default' : 'outline'}
            onClick={() => setTestMode('appointment')}
          >
            Randevu Testleri
          </Button>
          <Button
            variant={testMode === 'availability' ? 'default' : 'outline'}
            onClick={() => setTestMode('availability')}
          >
            Müsaitlik Testleri
          </Button>
        </div>

        {/* Appointment Tests */}
        {testMode === 'appointment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Randevu Optimistic Updates</h3>
            
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                {appointments.length} randevu yüklendi
              </p>
              
              {appointments.slice(0, 3).map(appointment => (
                <div key={appointment.id} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1">
                    {appointment.customer?.firstName || appointment.manualCustomerName || 'Müşteri'} - {appointment.date} {appointment.startTime}
                  </span>
                  <Badge variant="outline">{appointment.status}</Badge>
                  
                  <div className="flex gap-1">
                    {appointment.status !== 'CONFIRMED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAppointmentStatusUpdate(appointment.id, 'CONFIRMED')}
                        disabled={updateAppointmentStatus.isPending}
                      >
                        Onayla
                      </Button>
                    )}
                    {appointment.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAppointmentStatusUpdate(appointment.id, 'COMPLETED')}
                        disabled={updateAppointmentStatus.isPending}
                      >
                        Tamamla
                      </Button>
                    )}
                    {appointment.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAppointmentStatusUpdate(appointment.id, 'CANCELLED')}
                        disabled={updateAppointmentStatus.isPending}
                      >
                        İptal
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {appointments.length >= 2 && (
                <div className="pt-2 border-t">
                  <Button
                    onClick={() => handleBulkStatusUpdate(
                      appointments.slice(0, 2).map(apt => apt.id),
                      'CONFIRMED'
                    )}
                    disabled={bulkUpdateStatus.isPending}
                    className="mr-2"
                  >
                    İlk 2 Randevuyu Toplu Onayla
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleBulkStatusUpdate(
                      appointments.slice(0, 2).map(apt => apt.id),
                      'CANCELLED'
                    )}
                    disabled={bulkUpdateStatus.isPending}
                  >
                    İlk 2 Randevuyu Toplu İptal Et
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Tests */}
        {testMode === 'availability' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Müsaitlik Optimistic Updates</h3>
            
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                {timeBlocks.length} zaman bloğu yüklendi
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAvailabilityToggle(
                    new Date().toISOString().split('T')[0],
                    'test-staff-id',
                    true
                  )}
                  disabled={toggleAvailability.isPending}
                >
                  Bugünü Blokla
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAvailabilityToggle(
                    new Date().toISOString().split('T')[0],
                    'test-staff-id',
                    false
                  )}
                  disabled={toggleAvailability.isPending}
                >
                  Bugün Bloğunu Kaldır
                </Button>
                <Button
                  onClick={handleCreateTimeBlock}
                  disabled={createTimeBlock.isPending}
                >
                  Test Zaman Bloğu Oluştur
                </Button>
              </div>
              
              {timeBlocks.slice(0, 3).map(block => (
                <div key={block.id} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1">
                    {block.date} - {block.isFullDay ? 'Tüm gün' : `${block.startTime} - ${block.endTime}`}
                  </span>
                  <span className="text-sm text-muted-foreground">{block.reason}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTimeBlock.mutate(block.id)}
                    disabled={deleteTimeBlock.isPending}
                  >
                    Sil
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}