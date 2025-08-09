import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";
import { TimeSlot } from "@/lib/utils/time-slots";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  staff: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

interface DailyViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  staff: Staff[];
  timeSlots: TimeSlot[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DailyView({ 
  selectedDate, 
  onDateChange, 
  appointments, 
  staff, 
  timeSlots, 
  onAppointmentClick 
}: DailyViewProps) {
  const getAppointmentForSlot = (staffName: string, time: string) => {
    const selectedDateStr = dateToLocalString(selectedDate);
    return appointments.find((apt) => {
      const aptStaffName = `${apt.staff.firstName || ""} ${apt.staff.lastName || ""}`.trim();
      return aptStaffName === staffName && apt.startTime === time && apt.date === selectedDateStr;
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    onDateChange(newDate);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="ml-1 sm:ml-2 text-xs sm:text-base">Önceki</span>
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold text-center">
            {formatTurkishDate(dateToLocalString(selectedDate))}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <span className="mr-1 sm:mr-2 text-xs sm:text-base">Sonraki</span>
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Mobile Timeline View */}
        <div className="block lg:hidden">
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const appointmentsForSlot = staff
                .map((staffMember) => {
                  const staffName = `${staffMember.firstName} ${staffMember.lastName}`.trim();
                  return {
                    staff: staffMember,
                    appointment: getAppointmentForSlot(staffName, slot.start),
                  };
                })
                .filter((item) => item.appointment);

              if (appointmentsForSlot.length === 0) return null;

              return (
                <div key={slot.start} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{slot.start} - {slot.end}</div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    {appointmentsForSlot.map(({ staff: staffMember, appointment }, index) => {
                      const customerName = appointment?.customer
                        ? `${appointment.customer.firstName || ""} ${appointment.customer.lastName || ""}`.trim()
                        : appointment?.manualCustomerName || "Bilinmeyen Müşteri";
                      const customerPhone = appointment?.customer?.phone || appointment?.manualCustomerPhone || "";
                      const colorClass = index === 0
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                        : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400";

                      return (
                        <div
                          key={`${staffMember.id}-${slot.start}`}
                          className={`${colorClass} border-l-4 p-3 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => appointment && onAppointmentClick(appointment)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {staffMember.firstName} {staffMember.lastName}
                            </span>
                            {customerPhone && <span className="text-xs">{customerPhone}</span>}
                          </div>
                          <div className="font-semibold">{customerName}</div>
                          {appointment?.notes && (
                            <div className="text-sm">{appointment.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {timeSlots.every((slot) =>
              !staff.some((staffMember) => {
                const staffName = `${staffMember.firstName} ${staffMember.lastName}`.trim();
                return getAppointmentForSlot(staffName, slot.start);
              })
            ) && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Bu gün için randevu bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="h-12 flex items-center justify-center font-medium text-muted-foreground border-b">
              Saat
            </div>
            {timeSlots.map((slot) => (
              <div
                key={slot.start}
                className="h-16 flex items-center justify-center text-sm text-muted-foreground border-b border-border"
              >
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">{slot.start}</div>
                </div>
              </div>
            ))}
          </div>

          {staff.slice(0, 2).map((staffMember, staffIndex) => {
            const staffName = `${staffMember.firstName} ${staffMember.lastName}`.trim();
            const colorClass = staffIndex === 0 ? "blue" : "green";

            return (
              <div key={staffMember.id} className="space-y-3">
                <div
                  className={`h-12 flex items-center justify-center font-medium border-b bg-${colorClass}-50 dark:bg-${colorClass}-900/20`}
                >
                  {staffName}
                </div>
                {timeSlots.map((slot) => {
                  const appointment = getAppointmentForSlot(staffName, slot.start);
                  const customerName = appointment?.customer
                    ? `${appointment.customer.firstName || ""} ${appointment.customer.lastName || ""}`.trim()
                    : appointment?.manualCustomerName || "";

                  return (
                    <div key={slot.start} className="h-16 border border-border rounded-lg p-2">
                      {appointment ? (
                        <div
                          className={`bg-${colorClass}-100 dark:bg-${colorClass}-900/20 rounded-md p-2 h-full cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => onAppointmentClick(appointment)}
                        >
                          <div className={`text-xs font-medium text-${colorClass}-900 dark:text-${colorClass}-400`}>
                            {customerName || "Müşteri"}
                          </div>
                          {appointment.notes && (
                            <div className={`text-xs text-${colorClass}-700 dark:text-${colorClass}-400`}>
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full bg-muted/30 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}