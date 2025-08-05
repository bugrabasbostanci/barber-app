"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { StaffSelection } from './steps/StaffSelection';
import { DateSelection } from './steps/DateSelection';
import { TimeSelection } from './steps/TimeSelection';
import { CustomerInfo as CustomerInfoStep } from './steps/CustomerInfo';
import { BookingConfirmation } from './steps/BookingConfirmation';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { BookingService } from '../services/bookingService';
import { Staff, TimeSlot, BookingWizardProps, CustomerInfo as CustomerInfoType } from '../types/booking.types';

export function BookingWizard({ onComplete, onCancel }: BookingWizardProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    currentStep,
    bookingData,
    customerInfo,
    isBooking,
    phoneError,
    error,
    updateBookingData,
    updateCustomerInfo,
    setPhoneError,
    nextStep,
    prevStep,
    submitBooking,
    canGoNext,
    canGoBack,
    isLastStep,
    completedSteps,
  } = useBookingFlow();

  // Fetch staff on mount
  useEffect(() => {
    async function fetchStaff() {
      try {
        setLoading(true);
        const staffData = await BookingService.getStaff();
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  // Fetch time slots when date and staff change
  useEffect(() => {
    async function fetchTimeSlots() {
      if (!bookingData.date || !bookingData.staffId) return;

      try {
        setLoading(true);
        const slots = await BookingService.getAvailableTimeSlots(
          bookingData.date,
          bookingData.staffId
        );
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeSlots();
  }, [bookingData.date, bookingData.staffId]);

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    const result = await submitBooking();
    if (result) {
      onComplete?.(bookingData);
    }
  };

  const handlePhoneChange = (phone: string) => {
    updateCustomerInfo({ phone });
    
    if (phone && !BookingService.validatePhoneNumber(phone)) {
      setPhoneError('Geçerli bir telefon numarası girin');
    } else {
      setPhoneError(undefined);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Randevu Al</h2>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Geri
              </Button>
            )}
          </div>
          
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="min-h-[300px] mb-6">
          {currentStep === 'staff' && (
            <StaffSelection
              staff={staff}
              selectedStaffId={bookingData.staffId}
              onSelect={(staffId) => updateBookingData({ staffId })}
              loading={loading}
            />
          )}

          {currentStep === 'date' && (
            <DateSelection
              selectedDate={bookingData.date}
              onSelect={(date) => updateBookingData({ date })}
            />
          )}

          {currentStep === 'time' && bookingData.date && bookingData.staffId && (
            <TimeSelection
              date={bookingData.date}
              staffId={bookingData.staffId}
              selectedTime={bookingData.timeSlot}
              onSelect={(time) => updateBookingData({ timeSlot: time })}
              timeSlots={timeSlots}
              loading={loading}
            />
          )}

          {currentStep === 'customer' && (
            <CustomerInfoStep
              customerInfo={customerInfo}
              onUpdate={updateCustomerInfo}
              phoneError={phoneError}
              onPhoneChange={handlePhoneChange}
            />
          )}

          {currentStep === 'confirmation' && (
            <BookingConfirmation
              bookingData={bookingData}
              staff={staff}
              customerInfo={customerInfo as CustomerInfoType}
              onConfirm={handleSubmit}
              onBack={prevStep}
              loading={isBooking}
            />
          )}
        </div>

        {/* Navigation - Hide for confirmation step since it has its own buttons */}
        {currentStep !== 'confirmation' && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={!canGoBack}
            >
              Önceki
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canGoNext || isBooking}
              className="min-w-24"
            >
              {isBooking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Sonraki'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}