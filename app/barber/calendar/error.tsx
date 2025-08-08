"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberCalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber calendar errors
    console.error("Barber Calendar Error:", error);

    // Track calendar system errors for analytics
    // Critical for schedule management functionality
  }, [error]);

  // Common barber calendar error scenarios
  const getErrorMessage = () => {
    if (
      error.message.includes("schedule") ||
      error.message.includes("availability")
    ) {
      return {
        title: "Program Bilgileri Yüklenemedi",
        description:
          "Çalışma programınız ve müsaitlik bilgileri yüklenirken bir hata oluştu.",
        suggestions: [
          "Program ayarlarınızı kontrol edin",
          "Müsaitlik verilerinin senkronize olmasını bekleyin",
          "Sayfayı yenilemeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("time") ||
      error.message.includes("slot")
    ) {
      return {
        title: "Zaman Dilimi Sorunu",
        description:
          "Zaman dilimları ve saatlik programlar yüklenirken bir hata oluştu.",
        suggestions: [
          "Sistem saatinizi kontrol edin",
          "Zaman dilimi ayarlarınızı gözden geçirin",
          "Takvim verilerini yenilemeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("event") ||
      error.message.includes("appointment")
    ) {
      return {
        title: "Takvim Etkinlikleri Sorunu",
        description:
          "Randevular ve etkinlikler takvimde görüntülenirken bir hata oluştu.",
        suggestions: [
          "Randevu verilerinin yüklenmesini bekleyin",
          "Takvim görünümünü değiştirip tekrar deneyin",
          "Sayfayı yenilemeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("sync") ||
      error.message.includes("update")
    ) {
      return {
        title: "Takvim Senkronizasyon Sorunu",
        description: "Takvim verileri senkronize edilirken bir hata oluştu.",
        suggestions: [
          "İnternet bağlantınızı kontrol edin",
          "Veri senkronizasyonunun tamamlanmasını bekleyin",
          "Takvimi manuel olarak yenilemeyi deneyin",
        ],
      };
    } else {
      return {
        title: "Takvim Yükleme Sorunu",
        description: "Takvim sistemi yüklenirken beklenmeyen bir hata oluştu.",
        suggestions: [
          "Sayfayı yenilemeyi deneyin",
          "Tarayıcı önbelleğini temizleyin",
          "Farklı takvim görünümünü deneyebilirsiniz",
        ],
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">{errorInfo.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error suggestions */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Çözüm önerileri:</p>
                <ul className="text-xs space-y-1 ml-2">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Takvimi Yenile
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => (window.location.href = "/barber/dashboard")}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Panel
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/schedule")}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Program
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/appointments")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Randevular
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Takvim sorunları devam ederse randevuları listeden takip
              edebilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
