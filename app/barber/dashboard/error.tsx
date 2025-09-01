"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber dashboard errors
    console.error("Barber Dashboard Error:", error);

    // Track barber dashboard errors for analytics
    // This helps identify common issues barbers face
  }, [error]);

  // Common barber dashboard error scenarios
  const getErrorMessage = () => {
    if (error.message.includes("appointment")) {
      return {
        title: "Appointment Data Error",
        description:
          "An error occurred while loading appointment information. Your dashboard data may not be up to date.",
        suggestions: [
          "Wait for appointment data to synchronize",
          "Check your internet connection",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("statistics") ||
      error.message.includes("dashboard")
    ) {
      return {
        title: "Dashboard Statistics Error",
        description: "An error occurred while loading statistics and summary information.",
        suggestions: [
          "Wait for data synchronization to complete",
          "Try clearing your browser cache",
          "Try refreshing the page",
        ],
      };
    } else if (error.message.includes("calendar")) {
      return {
        title: "Calendar Data Error",
        description: "An error occurred while loading calendar and schedule information.",
        suggestions: [
          "Check calendar synchronization",
          "Review your schedule settings",
          "Try refreshing the page",
        ],
      };
    } else {
      return {
        title: "Dashboard Loading Error",
        description: "An unexpected error occurred while loading the barber dashboard.",
        suggestions: [
          "Try refreshing the page",
          "Check your internet connection",
          "Try restarting your browser",
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
              Refresh Dashboard
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
                onClick={() => (window.location.href = "/barber/appointments")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Appointments
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Home Page
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              If the problem persists, please contact technical support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
