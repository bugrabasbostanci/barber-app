"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  BrandTitle,
  SectionTitle,
  ServiceTitle,
  TypographyP,
} from "@/components/ui/typography";
import {
  Calendar,
  Clock,
  ArrowRight,
  Scissors,
  Zap,
  Sparkles,
  Crown,
  Star,
  Award,
  CheckCircle,
} from "lucide-react";

// Barber services
const services = [
  {
    id: 1,
    name: "Hair Cut",
    description: "Professional hair cutting and styling",
    icon: Scissors,
  },
  {
    id: 2,
    name: "Beard Trim",
    description: "Professional beard cutting and grooming",
    icon: Award,
  },
  {
    id: 3,
    name: "Kids Cut",
    description: "Special haircut service for children",
    icon: Star,
  },
  {
    id: 4,
    name: "Waxing",
    description: "Professional waxing service",
    icon: Zap,
  },
  {
    id: 5,
    name: "Face Mask",
    description: "Skincare mask application",
    icon: Sparkles,
  },
  {
    id: 6,
    name: "Wash/Blow-dry",
    description: "Hair washing and blow-drying",
    icon: Crown,
  },
  {
    id: 7,
    name: "Hair Mask",
    description: "Nourishing hair mask treatment",
    icon: Sparkles,
  },
  {
    id: 8,
    name: "Eyebrow Shaping",
    description: "Threading/Wax/Tweezer eyebrow shaping",
    icon: Star,
  },
  {
    id: 9,
    name: "Single Color Hair Dye",
    description: "Professional hair coloring service",
    icon: Crown,
  },
  {
    id: 10,
    name: "Groom Package",
    description: "Premium grooming package for special occasions",
    icon: Award,
  },
];

const ServicesList = () => {
  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
      {services.map((service) => (
        <div
          key={service.id}
          className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          {service.name}
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const { user, loading, hydrated, isCustomer, canAccessBarberPanel } =
    useAuth();

  // Show loading until both hydrated and not loading
  const isLoading = !hydrated || loading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 py-8 pb-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <BrandTitle className="mb-4">Book Your Appointment</BrandTitle>
          <TypographyP className="text-muted-foreground mb-8 mt-0">
            Get professional service from our experienced barbers
          </TypographyP>

          {/* CTA Button */}
          {isLoading ? (
            // Loading state - prevents role check issues
            <Button
              size="lg"
              disabled
              className="w-full h-16 text-xl font-semibold rounded-2xl opacity-60"
            >
              <div className="animate-pulse">Loading...</div>
            </Button>
          ) : isCustomer() ? (
            // Customer: Active appointment button
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/book-appointment">
                Book Appointment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          ) : !user ? (
            // Guest: Login redirect
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/auth/login?redirect=/book-appointment">
                Book Appointment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          ) : canAccessBarberPanel() ? (
            // Barber: Disabled with explanation
            <div className="space-y-2">
              <Button
                size="lg"
                disabled
                variant="secondary"
                className="w-full h-16 text-xl font-semibold rounded-2xl"
              >
                Book Appointment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                You can access the barber panel from the menu
              </p>
            </div>
          ) : (
            // Fallback: Unknown role, allow login attempt
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/auth/login?redirect=/book-appointment">
                Book Appointment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        {/* Services Marquee */}
        <div className="mb-8">
          <SectionTitle className="mb-6 text-center flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Our Services
          </SectionTitle>
          <ServicesList />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-muted rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">45 Minutes</p>
            <p className="text-sm text-muted-foreground">Full service</p>
          </div>
          <div className="text-center p-6 bg-muted rounded-2xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">Advanced Booking</p>
            <p className="text-sm text-muted-foreground">
              Up to 7 days in advance
            </p>
          </div>
        </div>

        {/* Hours */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <ServiceTitle className="mb-4">Working Hours</ServiceTitle>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monday - Saturday</span>
                <span className="font-medium">09:30 - 21:30</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-destructive font-medium">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        {/* Final CTA */}
        {isLoading ? (
          // Loading state - consistent with hero CTA
          <Button
            size="lg"
            disabled
            className="w-full h-16 text-xl font-semibold rounded-2xl opacity-60"
          >
            <div className="animate-pulse">Loading...</div>
          </Button>
        ) : isCustomer() ? (
          // Customer: Active appointment button
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/book-appointment">
              Book Your Appointment
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        ) : !user ? (
          // Guest: Login redirect
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/auth/login?redirect=/book-appointment">
              Book Your Appointment
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        ) : canAccessBarberPanel() ? (
          // Barber: Disabled with explanation
          <div className="space-y-2">
            <Button
              size="lg"
              disabled
              variant="secondary"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
            >
              Book Your Appointment
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You can access the barber panel from the menu
            </p>
          </div>
        ) : (
          // Fallback: Unknown role, allow login attempt
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/auth/login?redirect=/book-appointment">
              Book Your Appointment
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
