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

// Berber hizmetleri
const services = [
  {
    id: 1,
    name: "Saç Tıraşı",
    description: "Profesyonel saç kesimi ve şekillendirme",
    icon: Scissors,
  },
  {
    id: 2,
    name: "Sakal Tıraşı",
    description: "Profesyonel sakal kesimi ve düzenleme",
    icon: Award,
  },
  {
    id: 3,
    name: "Çocuk Tıraşı",
    description: "Çocuklar için özel tıraş hizmeti",
    icon: Star,
  },
  {
    id: 4,
    name: "Ağda",
    description: "Profesyonel ağda uygulaması",
    icon: Zap,
  },
  {
    id: 5,
    name: "Maske",
    description: "Cilt bakım maskesi uygulaması",
    icon: Sparkles,
  },
  {
    id: 6,
    name: "Yıkama/Fön",
    description: "Saç yıkama ve fön çekme",
    icon: Crown,
  },
  {
    id: 7,
    name: "Saç Maskesi",
    description: "Besleyici saç maskesi uygulaması",
    icon: Sparkles,
  },
  {
    id: 8,
    name: "Kaş Düzenleme",
    description: "İp/Ağda/Cımbız ile kaş düzenleme",
    icon: Star,
  },
  {
    id: 9,
    name: "Tek Renk Saç Boyası",
    description: "Profesyonel saç boyama hizmeti",
    icon: Crown,
  },
  {
    id: 10,
    name: "Damat Tıraşı",
    description: "Özel gün için premium tıraş paketi",
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
          <BrandTitle className="mb-4">Randevunuzu Alın</BrandTitle>
          <TypographyP className="text-muted-foreground mb-8 mt-0">
            Deneyimli berberlerimizden profesyonel hizmet alın
          </TypographyP>

          {/* CTA Button */}
          {isLoading ? (
            // Loading state - prevents role check issues
            <Button
              size="lg"
              disabled
              className="w-full h-16 text-xl font-semibold rounded-2xl opacity-60"
            >
              <div className="animate-pulse">Yükleniyor...</div>
            </Button>
          ) : isCustomer() ? (
            // Customer: Active appointment button
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/book-appointment">
                Randevu Al
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
                Randevu Al
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
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Berber paneline menüden erişebilirsiniz
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
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        {/* Services Marquee */}
        <div className="mb-8">
          <SectionTitle className="mb-6 text-center flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Hizmetlerimiz
          </SectionTitle>
          <ServicesList />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-muted rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">45 Dakika</p>
            <p className="text-sm text-muted-foreground">Tam hizmet</p>
          </div>
          <div className="text-center p-6 bg-muted rounded-2xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-semibold">Önceden Rezervasyon</p>
            <p className="text-sm text-muted-foreground">
              7 gün öncesine kadar
            </p>
          </div>
        </div>

        {/* Hours */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <ServiceTitle className="mb-4">Çalışma Saatleri</ServiceTitle>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Pazartesi - Cumartesi</span>
                <span className="font-medium">09:30 - 21:30</span>
              </div>
              <div className="flex justify-between">
                <span>Pazar</span>
                <span className="text-destructive font-medium">Kapalı</span>
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
            <div className="animate-pulse">Yükleniyor...</div>
          </Button>
        ) : isCustomer() ? (
          // Customer: Active appointment button
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/book-appointment">
              Randevunuzu Alın
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
              Randevunuzu Alın
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
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Berber paneline menüden erişebilirsiniz
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
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
