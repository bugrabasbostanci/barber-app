"use client";

import { useEffect, useState } from "react";
import {
  ImportantStatsCard,
  SubsectionHeader,
  AppointmentStatusBadge,
} from "@/shared/components";
import { Users, Clock } from "lucide-react";
import { utcToLocalDate, formatTurkishDateShort } from "@/lib/date-time";

interface ImportantData {
  todayCustomers: number;
  recentAppointments: Array<{
    id: string;
    customerName: string;
    date: Date;
    startTime: string;
    status: string;
  }>;
}

export function DashboardImportantStats() {
  const [data, setData] = useState<ImportantData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/important")
      .then((res) => res.json())
      .then((data) => {
        // Parse date strings back to Date objects
        if (data.recentAppointments) {
          data.recentAppointments = data.recentAppointments.map(
            (appointment: ImportantData["recentAppointments"][0]) => ({
              ...appointment,
              date: new Date(appointment.date),
            })
          );
        }
        setData(data);
      })
      .catch((error) =>
        console.error("Error fetching important dashboard data:", error)
      );
  }, []);

  if (!data) {
    return (
      <div className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ImportantStatsCard
            title="Bugünkü Müşteri"
            value="..."
            color="green"
            icon={Users}
            loading={true}
          />
          <ImportantStatsCard
            title="Son Randevular"
            value="..."
            color="purple"
            icon={Clock}
            loading={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ImportantStatsCard
          title="Bugünkü Müşteri"
          value={data.todayCustomers}
          color="green"
          icon={Users}
        />
        <ImportantStatsCard
          title="Son Randevular"
          value={data.recentAppointments.length}
          color="purple"
          icon={Clock}
        />
      </div>

      {/* Recent Appointments List */}
      {data.recentAppointments.length > 0 && (
        <div>
          <SubsectionHeader title="Son Randevular" className="mb-3" />
          <div className="space-y-2">
            {data.recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent hover:shadow-sm transition-all border-l-4 border-l-primary"
              >
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">
                    {appointment.customerName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTurkishDateShort(utcToLocalDate(appointment.date))} •{" "}
                    {appointment.startTime}
                  </div>
                </div>
                <div className="ml-4">
                  <AppointmentStatusBadge
                    status={
                      appointment.status as
                        | "PENDING"
                        | "CONFIRMED"
                        | "SCHEDULED"
                        | "COMPLETED"
                        | "CANCELLED"
                        | "NO_SHOW"
                    }
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
