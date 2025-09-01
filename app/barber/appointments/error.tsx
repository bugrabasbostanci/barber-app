"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberAppointmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber appointments errors
    console.error("Barber Appointments Error:", error);

    // Track appointment management errors for analytics
    // Critical for identifying appointment system issues
  }, [error]);

  // Common barber appointments error scenarios
  const getErrorMessage = () => {
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return {
        title: "Appointment Data Failed to Load",
        description: "A connection error occurred while loading the appointment list.",
        suggestions: [
          "Check your internet connection",
          "Wait for server connection and try again",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("update") ||
      error.message.includes("save")
    ) {
      return {
        title: "Appointment Update Error",
        description: "An error occurred while saving appointment changes.",
        suggestions: [
          "Try saving your changes again",
          "Check form fields",
          "Check your internet connection",
        ],
      };
    } else if (
      error.message.includes("delete") ||
      error.message.includes("cancel")
    ) {
      return {
        title: "Appointment Cancellation Error",
        description: "The appointment cancellation could not be completed.",
        suggestions: [
          "Try the cancellation process again",
          "Check that the appointment is eligible for cancellation",
          "Contact the customer to inform them of the situation",
        ],
      };
    } else if (
      error.message.includes("create") ||
      error.message.includes("add")
    ) {
      return {
        title: "New Appointment Creation Error",
        description: "An error occurred while creating a new appointment.",
        suggestions: [
          "Make sure all required fields are filled",
          "Check that the selected time is available",
          "Try filling out the appointment form again",
        ],
      };
    } else {
      return {
        title: "Appointment Management Error",
        description: "An unexpected error occurred while loading the appointment system.",
        suggestions: [
          "Try refreshing the page",
          "Clear your browser cache",
          "Try again in a few minutes",
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
              Refresh Appointments
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
                onClick={() => (window.location.href = "/barber/calendar")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Calendar
              </Button>

              <Button
                onClick={() =>
                  (window.location.href = "/barber/appointments/new")
                }
                variant="outline"
                size="sm"
              >
                <Users className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              In emergencies, call your customers to inform them by phone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
