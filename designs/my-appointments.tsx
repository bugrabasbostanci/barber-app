"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  User,
  LogOut,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "./avatar";
import Link from "next/link";

export default function MyAppointments() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [appointments] = useState([
    {
      id: 1,
      date: "2024-01-15",
      time: "14:30",
      duration: 45, // minutes
      barber: "John",
      price: 35,
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-01-22",
      time: "16:00",
      duration: 45,
      barber: "Mike",
      price: 35,
      status: "confirmed",
    },
    {
      id: 3,
      date: "2024-01-08",
      time: "10:15",
      duration: 45,
      barber: "David",
      price: 35,
      status: "completed",
    },
    {
      id: 4,
      date: "2024-01-05",
      time: "15:30",
      duration: 45,
      barber: "John",
      price: 35,
      status: "completed",
    },
  ]);

  // Mock user data
  const user = {
    name: "John Smith",
    email: "john@example.com",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const upcoming = appointments.filter((apt) => apt.status === "confirmed");
  const past = appointments.filter((apt) => apt.status === "completed");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeRange = (time: string, duration: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime.getTime() + duration * 60000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    return `${formatTime(startTime)}-${formatTime(endTime)}`;
  };

  const renderAppointmentCard = (appointment: any) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge
            className={
              appointment.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {appointment.status === "confirmed" ? "Confirmed" : "Completed"}
          </Badge>
          <span className="font-bold text-lg">${appointment.price}</span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <span className="font-medium">{formatDate(appointment.date)}</span>
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            <span>
              {formatTimeRange(appointment.time, appointment.duration)}
            </span>
          </div>

          <div className="flex items-center">
            <UserCheck className="w-4 h-4 mr-3 text-gray-400" />
            <span>{appointment.barber}</span>
          </div>
        </div>

        {appointment.status === "confirmed" ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Book Again
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Avatar Dropdown */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50 relative">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">My Appointments</h1>

          {/* Avatar Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <Avatar
              name={user.name}
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <Link href="/profile" onClick={() => setShowDropdown(false)}>
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Profile</span>
                  </div>
                </Link>

                <Link href="/" onClick={() => setShowDropdown(false)}>
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">Home</span>
                  </div>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                  onClick={() => setShowDropdown(false)}
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-blue-50 rounded-2xl">
            <p className="text-2xl font-bold text-blue-600">
              {upcoming.length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-2xl">
            <p className="text-2xl font-bold text-green-600">{past.length}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    No upcoming appointments
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Book your next appointment
                  </p>
                  <Link href="/">
                    <Button size="lg" className="w-full">
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div>{upcoming.map(renderAppointmentCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-lg mb-2">
                    No past appointments
                  </h3>
                  <p className="text-gray-500">
                    Your appointment history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>{past.map(renderAppointmentCard)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
