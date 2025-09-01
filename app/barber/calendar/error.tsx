"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberCalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber calendar errors
    console.error("Barber Calendar Error:", error);

    // Track calendar system errors for analytics
    // Critical for schedule management functionality
  }, [error]);

  // Common barber calendar error scenarios
  const getErrorMessage = () => {
    if (
      error.message.includes("schedule") ||
      error.message.includes("availability")
    ) {
      return {
        title: "Schedule Information Failed to Load",
        description:
          "An error occurred while loading your work schedule and availability information.",
        suggestions: [
          "Check your schedule settings",
          "Wait for availability data to synchronize",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("time") ||
      error.message.includes("slot")
    ) {
      return {
        title: "Time Slot Error",
        description:
          "An error occurred while loading time slots and hourly schedules.",
        suggestions: [
          "Check your system time",
          "Review your timezone settings",
          "Try refreshing calendar data",
        ],
      };
    } else if (
      error.message.includes("event") ||
      error.message.includes("appointment")
    ) {
      return {
        title: "Calendar Events Error",
        description:
          "An error occurred while displaying appointments and events in the calendar.",
        suggestions: [
          "Wait for appointment data to load",
          "Change calendar view and try again",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("sync") ||
      error.message.includes("update")
    ) {
      return {
        title: "Calendar Synchronization Error",
        description: "An error occurred while synchronizing calendar data.",
        suggestions: [
          "Check your internet connection",
          "Wait for data synchronization to complete",
          "Try manually refreshing the calendar",
        ],
      };
    } else {
      return {
        title: "Calendar Loading Error",
        description: "An unexpected error occurred while loading the calendar system.",
        suggestions: [
          "Try refreshing the page",
          "Clear your browser cache",
          "Try a different calendar view",
        ],
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">{errorInfo.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error suggestions */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Solution suggestions:</p>
                <ul className="text-xs space-y-1 ml-2">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Calendar
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => (window.location.href = "/barber/dashboard")}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Dashboard
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/schedule")}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Schedule
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/appointments")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Appointments
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              If calendar issues persist, you can track appointments from the
              appointments list.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
