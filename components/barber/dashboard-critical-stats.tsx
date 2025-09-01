"use client";

import { useEffect, useState } from "react";
import { CriticalStatsCard, SectionTitle } from "@/shared/components";
import { Calendar } from "lucide-react";

export function DashboardCriticalStats() {
  const [data, setData] = useState<{ todayAppointments: number } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/critical")
      .then((res) => res.json())
      .then(setData)
      .catch((error) =>
        console.error("Error fetching critical dashboard data:", error)
      );
  }, []);

  if (!data) {
    return (
      <div className="mb-4">
        <SectionTitle title="Today" className="mb-4" />
        <div className="grid grid-cols-1 gap-4">
          <CriticalStatsCard
            title="Today's Appointments"
            value="..."
            color="blue"
            icon={Calendar}
            loading={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <SectionTitle title="Today" className="mb-4" />
      <div className="grid grid-cols-1 gap-4">
        <CriticalStatsCard
          title="Today's Customers"
          value={data.todayAppointments}
          color="blue"
          icon={Calendar}
        />
      </div>
    </div>
  );
}
