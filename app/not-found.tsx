import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Home, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            404
          </CardTitle>
          <p className="text-gray-600">
            The page you&apos;re looking for could not be found
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            This page may have been deleted, moved, or never existed.
          </p>

          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/book-appointment">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Popular Pages:</strong>
            </p>
            <div className="mt-2 text-xs text-blue-700 space-y-1">
              <div>
                •{" "}
                <Link href="/my-appointments" className="hover:underline">
                  My Appointments
                </Link>
              </div>
              <div>
                •{" "}
                <Link href="/profile" className="hover:underline">
                  Profile Settings
                </Link>
              </div>
              <div>
                •{" "}
                <Link href="/book-appointment" className="hover:underline">
                  New Appointment
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
