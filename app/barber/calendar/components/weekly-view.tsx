import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dateToLocalString } from "@/lib/utils";
import { TimeSlot } from "@/lib/utils";
import { getWeekDates } from "@/lib/utils";

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

interface WeeklyViewProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  appointments: Appointment[];
  staff: Staff[];
  timeSlots: TimeSlot[];
}

export function WeeklyView({ 
  currentWeek, 
  onWeekChange, 
  appointments, 
  staff, 
  timeSlots 
}: WeeklyViewProps) {
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    onWeekChange(newDate);
  };

  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="ml-1 sm:ml-2 text-xs sm:text-base">Previous</span>
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold text-center">
            {getWeekDates(currentWeek)[0].toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            })}{" "}
            -{" "}
            {getWeekDates(currentWeek)[6].toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <span className="mr-1 sm:mr-2 text-xs sm:text-base">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Mobile Week View - Day by Day */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {getWeekDates(currentWeek).map((date, index) => {
              const dateStr = dateToLocalString(date);
              const dayAppointments = appointments.filter((apt) => apt.date === dateStr);

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">
                        {date.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {date.toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "long",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{dayAppointments.length} appointments</div>
                    </div>
                  </div>

                  {dayAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {dayAppointments.slice(0, 3).map((apt, aptIndex) => {
                        const staffName = `${apt.staff.firstName || ""} ${apt.staff.lastName || ""}`.trim();
                        const customerName = apt.customer
                          ? `${apt.customer.firstName || ""} ${apt.customer.lastName || ""}`.trim()
                          : apt.manualCustomerName || "Customer";
                        const staffIndex = staff.findIndex((s) => 
                          `${s.firstName} ${s.lastName}`.trim() === staffName
                        );
                        const colorClass = staffIndex === 0
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";

                        return (
                          <div key={aptIndex} className={`p-2 rounded text-xs ${colorClass}`}>
                            <div className="font-medium">{apt.startTime} - {customerName}</div>
                          </div>
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      No appointments
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Week Grid */}
        <div className="hidden lg:grid lg:grid-cols-8 gap-2">
          <div className="font-medium text-muted-foreground p-2">Time</div>
          {getWeekDates(currentWeek).map((date, index) => (
            <div key={index} className="text-center p-2 font-medium">
              <div className="text-sm">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg">{date.getDate()}</div>
            </div>
          ))}

          {timeSlots.map((slot) => (
            <div key={slot.start} className="contents">
              <div className="text-sm text-muted-foreground p-2 border-t">{slot.start}</div>
              {getWeekDates(currentWeek).map((date, dayIndex) => {
                const dateStr = dateToLocalString(date);
                const appointment = appointments.find(
                  (apt) => apt.date === dateStr && apt.startTime === slot.start
                );

                return (
                  <div
                    key={dayIndex}
                    className="h-16 border border-border rounded-lg p-1 border-t"
                  >
                    {appointment ? (() => {
                      const staffName = `${appointment.staff.firstName || ""} ${appointment.staff.lastName || ""}`.trim();
                      const staffIndex = staff.findIndex((s) => 
                        `${s.firstName} ${s.lastName}`.trim() === staffName
                      );
                      const colorClass = staffIndex === 0 ? "blue" : "green";
                      const customerName = appointment.customer
                        ? `${appointment.customer.firstName || ""} ${appointment.customer.lastName || ""}`.trim()
                        : appointment.manualCustomerName || "Customer";

                      return (
                        <div className={`bg-${colorClass}-100 dark:bg-${colorClass}-900/20 rounded-md p-1 h-full`}>
                          <div className={`text-xs font-medium text-${colorClass}-900 dark:text-${colorClass}-400`}>
                            {customerName}
                          </div>
                        </div>
                      );
                    })() : null}
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