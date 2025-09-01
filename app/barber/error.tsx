"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber-specific errors
    console.error("Barber Route Error:", error);

    // Track barber management errors for analytics
    // Important for business operations tracking
  }, [error]);

  // Common barber system error scenarios
  const getErrorMessage = () => {
    if (
      error.message.includes("auth") ||
      error.message.includes("permission")
    ) {
      return {
        title: "Authorization Error",
        description:
          "An error occurred while verifying your barber panel access permissions.",
        suggestions: [
          "Check your session information",
          "Try logging in again",
          "Verify your barber account permissions",
        ],
      };
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      return {
        title: "Connection Error",
        description:
          "A connection error occurred while accessing barber panel data.",
        suggestions: [
          "Check your internet connection",
          "Try disabling VPN if you're using one",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("data") ||
      error.message.includes("load")
    ) {
      return {
        title: "Data Loading Error",
        description: "An error occurred while loading barber panel data.",
        suggestions: [
          "Wait for data synchronization and try again",
          "Clear your browser cache",
          "Try refreshing the page",
        ],
      };
    } else if (
      error.message.includes("session") ||
      error.message.includes("expire")
    ) {
      return {
        title: "Session Expired",
        description:
          "Your session may have expired or become invalid.",
        suggestions: [
          "Log in again",
          "Refresh your session information",
          "Restart your browser",
        ],
      };
    } else {
      return {
        title: "Barber Panel Error",
        description:
          "An unexpected error occurred while loading the barber management panel.",
        suggestions: [
          "Try refreshing the page",
          "Restart your browser",
          "Try using a different browser",
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
              Refresh Barber Panel
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Home Page
              </Button>

              <Button
                onClick={() => (window.location.href = "/auth/login")}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </div>

            {/* Quick access to main barber sections (if accessible) */}
            <div className="grid grid-cols-3 gap-1 mt-2">
              <Button
                onClick={() => (window.location.href = "/barber/dashboard")}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Dashboard
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/calendar")}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Calendar
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/schedule")}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Schedule
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              If the problem persists, please contact the system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
