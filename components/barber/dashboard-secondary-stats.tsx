'use client';

import { useEffect, useState } from "react";
import { SecondaryStatsCard, SubsectionHeader } from "@/shared/components";
import { Users, UserCheck } from "lucide-react";

interface SecondaryData {
  totalCustomers: number;
  totalUsers: number;
}

export function DashboardSecondaryStats() {
  const [data, setData] = useState<SecondaryData | null>(null);
  
  useEffect(() => {
    fetch('/api/dashboard/secondary')
      .then(res => res.json())
      .then(setData)
      .catch(error => console.error('Error fetching secondary dashboard data:', error));
  }, []);

  if (!data) {
    return (
      <div className="mb-4">
        <SubsectionHeader 
          title="Genel İstatistikler" 
          className="mb-3" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SecondaryStatsCard
            title="Toplam Müşteri"
            value="..."
            color="orange"
            icon={Users}
            loading={true}
          />
          <SecondaryStatsCard
            title="Toplam Kullanıcı"
            value="..."
            color="indigo"
            icon={UserCheck}
            loading={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <SubsectionHeader 
        title="Genel İstatistikler" 
        className="mb-3" 
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecondaryStatsCard
          title="Toplam Müşteri"
          value={data.totalCustomers}
          color="orange"
          icon={Users}
        />
        <SecondaryStatsCard
          title="Toplam Kullanıcı"
          value={data.totalUsers}
          color="indigo"
          icon={UserCheck}
        />
      </div>
    </div>
  );
}