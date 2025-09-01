import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";

export function DashboardQuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Link href="/barber/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Calendar</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Daily, weekly view
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Appointments */}
        <Link href="/barber/appointments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Appointments</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Appointment management
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Schedule */}
        <Link href="/barber/schedule">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Time Management</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Working hours
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}