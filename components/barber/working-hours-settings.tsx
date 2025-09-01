"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw } from "lucide-react";
import { BUSINESS_RULES } from "@/lib/constants";

interface DaySchedule {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export function WorkingHoursSettings() {
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    tuesday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    wednesday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    thursday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    friday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    saturday: {
      isOpen: true,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
    sunday: {
      isOpen: false,
      startTime: BUSINESS_RULES.WORKING_HOURS.start,
      endTime: BUSINESS_RULES.WORKING_HOURS.end,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const updateDaySchedule = (
    day: keyof WeekSchedule,
    field: keyof DaySchedule,
    value: boolean | string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Mock API call - in real app, save to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Working hours updated!");
    } catch {
      alert("An error occurred while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    setSchedule({
      monday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      tuesday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      wednesday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      thursday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      friday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      saturday: {
        isOpen: true,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
      sunday: {
        isOpen: false,
        startTime: BUSINESS_RULES.WORKING_HOURS.start,
        endTime: BUSINESS_RULES.WORKING_HOURS.end,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Settings Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Appointment Duration:</span>
              <span className="ml-2 font-medium">
                {BUSINESS_RULES.APPOINTMENT_DURATION} minutes
              </span>
            </div>
            <div>
              <span className="text-gray-600">Booking Window:</span>
              <span className="ml-2 font-medium">
                {BUSINESS_RULES.BOOKING_WINDOW_DAYS} days ahead
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cancellation Limit:</span>
              <span className="ml-2 font-medium">
                {BUSINESS_RULES.CANCELLATION_HOURS} hours before
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        {Object.entries(schedule).map(([day, daySchedule]) => (
          <Card key={day}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Day name and status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Label className="text-base font-medium">
                        {dayNames[day as keyof typeof dayNames]}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={daySchedule.isOpen}
                        onCheckedChange={(checked) =>
                          updateDaySchedule(
                            day as keyof WeekSchedule,
                            "isOpen",
                            checked
                          )
                        }
                      />
                      {daySchedule.isOpen ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Open
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-600"
                        >
                          Closed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time inputs - responsive layout */}
                {daySchedule.isOpen && (
                  <div className="sm:ml-28 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day}-start`} className="text-sm whitespace-nowrap w-16">
                        Start:
                      </Label>
                      <Input
                        id={`${day}-start`}
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) =>
                          updateDaySchedule(
                            day as keyof WeekSchedule,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="flex-1 max-w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day}-end`} className="text-sm whitespace-nowrap w-16">
                        End:
                      </Label>
                      <Input
                        id={`${day}-end`}
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) =>
                          updateDaySchedule(
                            day as keyof WeekSchedule,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="flex-1 max-w-32"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={resetToDefault}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
