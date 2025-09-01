"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Save,
  Search,
} from "lucide-react";
import { formatTurkishDate, dateToLocalString } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BUSINESS_RULES } from "@/lib/constants";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

export function NewAppointmentForm() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [customerType, setCustomerType] = useState<"existing" | "new">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    existingCustomerId: "",
    notes: "",
  });

  // Fetch staff from database
  const [staff, setStaff] = useState<Staff[]>([]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch staff members on component mount
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const staffData = await response.json();
          setStaff(staffData);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    }

    fetchStaff();
  }, []);

  // Fetch available time slots when date and staff change
  useEffect(() => {
    if (!selectedDate || !selectedStaff) {
      setTimeSlots([]);
      return;
    }

    async function fetchTimeSlots() {
      try {
        const dateStr = dateToLocalString(selectedDate!);
        const response = await fetch(
          `/api/time-slots?date=${dateStr}&staffId=${selectedStaff}`
        );

        if (response.ok) {
          const availableSlots = await response.json();
          const slots: TimeSlot[] = availableSlots.map((time: string) => ({
            time,
            available: true,
          }));
          setTimeSlots(slots);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      }
    }

    fetchTimeSlots();
  }, [selectedDate, selectedStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedStaff) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      customerType === "new" &&
      (!formData.customerName || !formData.customerPhone)
    ) {
      alert("Please enter customer name and phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/barber/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateToLocalString(selectedDate!),
          staffId: selectedStaff,
          startTime: selectedTime,
          customerType,
          customerName: customerType === 'new' ? formData.customerName : undefined,
          customerPhone: customerType === 'new' ? formData.customerPhone : undefined,
          existingCustomerId: customerType === 'existing' ? formData.existingCustomerId : undefined,
          notes: formData.notes
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Appointment created successfully!");
        router.push("/barber/appointments");
      } else {
        alert(result.error || "An error occurred while creating the appointment.");
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert("An error occurred while creating the appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date validation - only allow future dates within booking window
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + BUSINESS_RULES.BOOKING_WINDOW_DAYS);
    const isSunday = date.getDay() === 0; // Sunday is closed

    return date < today || date > maxDate || isSunday;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date, Time, Staff Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        formatTurkishDate(dateToLocalString(selectedDate))
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Staff Selection */}
              <div className="space-y-2">
                <Label>Barber/Staff</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && selectedStaff && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={
                        selectedTime === slot.time ? "default" : "outline"
                      }
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        !slot.available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {timeSlots.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Select date and staff
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type Selection */}
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={customerType === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomerType("new")}
                  >
                    New Customer
                  </Button>
                  <Button
                    type="button"
                    variant={
                      customerType === "existing" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCustomerType("existing")}
                  >
                    Existing Customer
                  </Button>
                </div>
              </div>

              {customerType === "new" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      placeholder="05XX XXX XX XX"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Existing Customer</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Search customer..." />
                    <Button type="button" variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Notes about the appointment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedDate && selectedTime && selectedStaff && (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formatTurkishDate(dateToLocalString(selectedDate))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {selectedTime} -{" "}
                    {(() => {
                      const endTime = new Date(`2000-01-01T${selectedTime}:00`);
                      endTime.setMinutes(endTime.getMinutes() + 45);
                      return endTime.toTimeString().slice(0, 5);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Barber:</span>
                  <span className="font-medium">
                    {staff.find((s) => s.id === selectedStaff)?.firstName}{" "}
                    {staff.find((s) => s.id === selectedStaff)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {BUSINESS_RULES.APPOINTMENT_DURATION} minutes
                  </span>
                </div>
                {(formData.customerName || formData.existingCustomerId) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {customerType === "new"
                        ? formData.customerName
                        : "Existing customer"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Appointment"}
        </Button>
      </div>
    </form>
  );
}
