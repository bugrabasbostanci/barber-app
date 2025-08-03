"use client";
// done
import { Calendar, Users, Clock, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BarberDashboard() {
  // Mock data
  const todayStats = {
    appointments: 8,
    revenue: 280,
    customers: 7,
    completion: 87,
  };

  // Get current date in Turkish format
  const getCurrentDate = () => {
    const today = new Date();
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const day = today.getDate().toString().padStart(2, "0");
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    return `${day} ${month} ${year}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Berber Paneli</h1>
            <p className="text-gray-500 mt-1">{getCurrentDate()}</p>
          </div>
          <Link href="/barber/appointments/new">
            <Button className="bg-black hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Randevu
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4">
        {/* Today's Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Bugün</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black mb-2">
                  {todayStats.appointments}
                </div>
                <div className="text-sm text-gray-600">Randevu</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black mb-2">
                  {todayStats.customers}
                </div>
                <div className="text-sm text-gray-600">Müşteri</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calendar */}
            <Link href="/barber/calendar">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <h3 className="font-semibold">Takvim</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Günlük, haftalık görünüm
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
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
                        <h3 className="font-semibold">Randevular</h3>
                      </div>
                      <p className="text-sm text-gray-600">Randevu yönetimi</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
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
                        <h3 className="font-semibold">Zaman Yönetimi</h3>
                      </div>
                      <p className="text-sm text-gray-600">Çalışma saatleri</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
