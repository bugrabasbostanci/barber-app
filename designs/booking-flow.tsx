"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Calendar,
  UserCheck,
  Clock,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFlowProps {
  onBack: () => void;
}

export function BookingFlow({ onBack }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    phone: "",
    notes: "",
  });

  const barbers = [
    {
      id: "john",
      name: "John",
      title: "Usta Berber",
      rating: 4.9,
      avatar: "J",
    },
    { id: "mike", name: "Mike", title: "Berber", rating: 4.8, avatar: "M" },
    { id: "david", name: "David", title: "Çalışan", rating: 4.7, avatar: "D" },
  ];

  // Generate next 7 available days (excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const currentDate = new Date(today);

    while (dates.length < 7) {
      if (currentDate.getDay() !== 0) {
        // Skip Sundays
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Generate time slots for selected barber and date
  const getAvailableTimeSlots = () => {
    const slots = [];

    // Generate slots from 09:30 to 20:45 (45-minute appointments)
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 9 && minute < 30) continue; // Start from 09:30
        if (hour === 20 && minute > 45) break; // End at 20:45

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }

    // Simulate some booked slots based on selected barber and date
    const availableSlots = slots.filter(() => Math.random() > 0.4); // 60% availability
    return availableSlots.slice(0, 16); // Show max 16 slots
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleBooking = () => {
    setStep(5);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pick a Date</h2>
              <p className="text-gray-500">Choose your preferred day</p>
            </div>

            <div className="space-y-3">
              {getAvailableDates().map((date, index) => {
                const isSelected =
                  selectedDate === date.toISOString().split("T")[0];
                const availableSlots = Math.floor(Math.random() * 12) + 8;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      setSelectedDate(date.toISOString().split("T")[0])
                    }
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-semibold text-lg">
                          {formatDate(date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {availableSlots} slots
                        </p>
                        <div className="flex justify-end mt-1">
                          {[1, 2, 3].map((dot) => (
                            <div
                              key={dot}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                availableSlots > 15
                                  ? "bg-green-400"
                                  : availableSlots > 10
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sunday Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600 text-center">
                <strong>Note:</strong> We're closed on Sundays
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <UserCheck className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose Your Barber</h2>
              <p className="text-gray-500">Select your preferred barber</p>
            </div>

            <div className="space-y-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarber === barber.id;

                return (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber.id)}
                    className={`w-full p-5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                        {barber.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-lg">{barber.name}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          {barber.title}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {barber.rating}
                          </span>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pick a Time</h2>
              <p className="text-gray-500">
                Available slots for{" "}
                {barbers.find((b) => b.id === selectedBarber)?.name} on{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {getAvailableTimeSlots().map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTime === time
                      ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium">{time}</p>
                    <p className="text-xs text-gray-500 mt-1">45 min</p>
                  </div>
                </button>
              ))}
            </div>

            {getAvailableTimeSlots().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No available slots for this barber on selected date
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="bg-transparent"
                >
                  Choose Different Barber
                </Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Contact Info</h2>
              <p className="text-gray-500">We'll send you a confirmation</p>
            </div>

            {/* Booking Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barber:</span>
                    <span className="font-medium">
                      {barbers.find((b) => b.id === selectedBarber)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {selectedTime} -{" "}
                      {(() => {
                        const [hours, minutes] = selectedTime
                          .split(":")
                          .map(Number);
                        const endTime = new Date();
                        endTime.setHours(hours, minutes + 45, 0, 0);
                        return endTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>$35</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="h-14 text-base mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Special Notes (optional)
                </Label>
                <textarea
                  id="notes"
                  value={customerInfo.notes || ""}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                  placeholder="Any special requests or notes for your barber..."
                  className="w-full h-24 p-3 text-base mt-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8 pb-32">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600">Your appointment is all set</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barber:</span>
                    <span className="font-medium">
                      {barbers.find((b) => b.id === selectedBarber)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {selectedTime} -{" "}
                      {(() => {
                        const [hours, minutes] = selectedTime
                          .split(":")
                          .map(Number);
                        const endTime = new Date();
                        endTime.setHours(hours, minutes + 45, 0, 0);
                        return endTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>$35</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
              <p>• Confirmation sent to {customerInfo.phone}</p>
              <p>• Cancel up to 2 hours before</p>
              <p>• Arrive 5 minutes early</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDate !== "";
      case 2:
        return selectedBarber !== "";
      case 3:
        return selectedTime !== "";
      case 4:
        return customerInfo.phone !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="font-semibold">Book Appointment</h1>
            {step < 5 && (
              <p className="text-xs text-gray-500">Step {step} of 4</p>
            )}
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Progress */}
      {step < 5 && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full transition-all ${
                  stepNum <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-8">{renderStepContent()}</div>

      {/* Navigation */}
      {step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex space-x-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-14"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={step === 4 ? handleBooking : () => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 h-14 text-base font-semibold"
            >
              {step === 4 ? "Confirm Booking" : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
          <Button
            onClick={onBack}
            className="w-full h-14 text-base font-semibold"
          >
            Book Another Appointment
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-base bg-transparent"
          >
            View My Appointments
          </Button>
        </div>
      )}
    </div>
  );
}
