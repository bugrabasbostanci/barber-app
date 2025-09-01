import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dateToLocalString } from "@/lib/utils";
import { getMonthDays } from "@/lib/utils";

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

interface MonthlyViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  appointments: Appointment[];
  staff: Staff[];
}

export function MonthlyView({ 
  currentMonth, 
  onMonthChange, 
  appointments, 
  staff 
}: MonthlyViewProps) {
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    onMonthChange(newDate);
  };

  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="ml-1 sm:ml-2 text-xs sm:text-base">Previous</span>
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold text-center">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
          >
            <span className="mr-1 sm:mr-2 text-xs sm:text-base">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Mobile Month View - Simplified */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={index} className="text-center font-bold text-sm p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getMonthDays(currentMonth).map((day, index) => {
              const dayAppointments = day
                ? appointments.filter((apt) => apt.date === dateToLocalString(day))
                : [];

              return (
                <div key={index} className="aspect-square border border-border rounded p-1">
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                      {dayAppointments.length > 0 && (
                        <div className="space-y-1">
                          {staff.map((staffMember, staffIndex) => {
                            const staffName = `${staffMember.firstName} ${staffMember.lastName}`.trim();
                            const staffAppointments = dayAppointments.filter((apt) => {
                              const aptStaffName = `${apt.staff.firstName || ""} ${apt.staff.lastName || ""}`.trim();
                              return aptStaffName === staffName;
                            });

                            if (staffAppointments.length === 0) return null;

                            const colorClass = staffIndex === 0 ? "bg-blue-200" : "bg-green-200";
                            return (
                              <div
                                key={staffMember.id}
                                className={`w-full h-1 ${colorClass} rounded`}
                              ></div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend for mobile */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
            {staff.map((staffMember, index) => {
              const colorClass = index === 0 ? "bg-blue-200" : "bg-green-200";
              return (
                <div key={staffMember.id} className="flex items-center">
                  <div className={`w-3 h-1 ${colorClass} rounded mr-1`}></div>
                  <span>{staffMember.firstName} {staffMember.lastName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Month Grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {getMonthDays(currentMonth).map((day, index) => {
            const dayAppointments = day
              ? appointments.filter((apt) => apt.date === dateToLocalString(day))
              : [];

            return (
              <div key={index} className="h-24 border border-border rounded-lg p-1">
                {day && (
                  <>
                    <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded px-1 py-0.5 mb-1">
                        {dayAppointments.length} appointments
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}