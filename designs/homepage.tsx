"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingFlow } from "./booking-flow";
import { Avatar } from "./avatar";
import Link from "next/link";

export default function HomePage() {
  const [showBooking, setShowBooking] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (showBooking) {
    return <BookingFlow onBack={() => setShowBooking(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Avatar Dropdown */}
      <header className="bg-white border-b px-4 py-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">The Barber Shop</h1>
            <p className="text-gray-500 text-sm">Premium Barbershop</p>
          </div>

          {/* Avatar Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <Avatar
              name={user.name}
              size="md"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {/* Dropdown Content */}
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

                <Link
                  href="/my-appointments"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">My Appointments</span>
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

      <div className="px-4 py-8 pb-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Book Your Cut</h2>
          <p className="text-xl text-gray-600 mb-2">$35 • 45 minutes</p>
          <p className="text-gray-500 mb-8">
            Professional service with experienced barbers
          </p>

          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            onClick={() => setShowBooking(true)}
          >
            Book Now
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

        {/* What's Included */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              What's Included
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Professional haircut & styling</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Beard trim & shaping</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Hot towel treatment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">45 Minutes</p>
            <p className="text-sm text-gray-500">Complete service</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">Book Ahead</p>
            <p className="text-sm text-gray-500">Up to 7 days</p>
          </div>
        </div>

        {/* Hours */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Hours</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Mon - Sat</span>
                <span className="font-medium">9:30 AM - 9:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-red-500 font-medium">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Button
          size="lg"
          className="w-full h-16 text-xl font-semibold rounded-2xl"
          onClick={() => setShowBooking(true)}
        >
          Book Your Appointment
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
