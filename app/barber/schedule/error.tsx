"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber schedule errors
    console.error("Barber Schedule Error:", error);

    // Track schedule management errors for analytics
    // Critical for availability and working hours functionality
  }, [error]);

  // Common barber schedule error scenarios
  const getErrorMessage = () => {
    if (
      error.message.includes("working-hours") ||
      error.message.includes("hours")
    ) {
      return {
        title: "Working Hours Issue",
        description:
          "An error occurred while setting or loading your working hours.",
        suggestions: [
          "Check that working hours are in the correct format",
          "Make sure start time is before end time",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("availability") ||
      error.message.includes("block")
    ) {
      return {
        title: "Availability Settings Issue",
        description:
          "An error occurred while setting your unavailable times.",
        suggestions: [
          "Check blocked time ranges",
          "Review overlapping time slots",
          "Try saving settings again",
        ],
      };
    } else if (
      error.message.includes("save") ||
      error.message.includes("update")
    ) {
      return {
        title: "Schedule Saving Issue",
        description: "An error occurred while saving schedule changes.",
        suggestions: [
          "Check that all required fields are filled",
          "Check your internet connection",
          "Try saving changes again",
        ],
      };
    } else if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
      return {
        title: "Schedule Validation Issue",
        description: "An error occurred while validating the entered schedule information.",
        suggestions: [
          "Check that time formats are correct (e.g., 09:00)",
          "Make sure end time is after start time",
          "Check weekday/weekend settings",
        ],
      };
    } else {
      return {
        title: "Schedule Settings Issue",
        description:
          "An unexpected error occurred while loading your work schedule.",
        suggestions: [
          "Try refreshing the page",
          "Clear browser cache",
          "Check default schedule settings",
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
              Refresh Schedule Settings
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => (window.location.href = "/barber/dashboard")}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/calendar")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Calendar
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/appointments")}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Appointments
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Schedule settings can be reset to default values.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
