"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarberScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log barber schedule errors
    console.error("Barber Schedule Error:", error);

    // Track schedule management errors for analytics
    // Critical for availability and working hours functionality
  }, [error]);

  // Common barber schedule error scenarios
  const getErrorMessage = () => {
    if (
      error.message.includes("working-hours") ||
      error.message.includes("hours")
    ) {
      return {
        title: "Çalışma Saatleri Sorunu",
        description:
          "Çalışma saatleriniz ayarlanırken veya yüklenirken bir hata oluştu.",
        suggestions: [
          "Çalışma saatlerinin doğru formatta olduğunu kontrol edin",
          "Başlangıç saatinin bitiş saatinden önce olduğundan emin olun",
          "Sayfayı yenilemeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("availability") ||
      error.message.includes("block")
    ) {
      return {
        title: "Müsaitlik Ayarları Sorunu",
        description:
          "Müsait olmadığınız zamanlar ayarlanırken bir hata oluştu.",
        suggestions: [
          "Blok edilen zaman aralıklarını kontrol edin",
          "Çakışan zaman dilimlerini gözden geçirin",
          "Ayarları tekrar kaydetmeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("save") ||
      error.message.includes("update")
    ) {
      return {
        title: "Program Kaydetme Sorunu",
        description: "Program değişiklikleri kaydedilirken bir hata oluştu.",
        suggestions: [
          "Tüm gerekli alanların dolu olduğunu kontrol edin",
          "İnternet bağlantınızı kontrol edin",
          "Değişiklikleri tekrar kaydetmeyi deneyin",
        ],
      };
    } else if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
      return {
        title: "Program Doğrulama Sorunu",
        description: "Girilen program bilgileri doğrulanırken bir hata oluştu.",
        suggestions: [
          "Saat formatlarının doğru olduğunu kontrol edin (ÖR: 09:00)",
          "Bitiş saatinin başlangıç saatinden sonra olduğundan emin olun",
          "Hafta içi/hafta sonu ayarlarını kontrol edin",
        ],
      };
    } else {
      return {
        title: "Program Ayarları Sorunu",
        description:
          "Çalışma programınız yüklenirken beklenmeyen bir hata oluştu.",
        suggestions: [
          "Sayfayı yenilemeyi deneyin",
          "Tarayıcı önbelleğini temizleyin",
          "Varsayılan program ayarlarını kontrol edin",
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
              Program Ayarlarını Yenile
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => (window.location.href = "/barber/dashboard")}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Panel
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/calendar")}
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Takvim
              </Button>

              <Button
                onClick={() => (window.location.href = "/barber/appointments")}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Randevular
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Program ayarları varsayılan değerlere döndürülebilir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
