"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Clock, Calendar, AlertTriangle } from "lucide-react";
import { ScheduleBusinessSettings } from "../types";

interface BusinessSettingsProps {
  businessSettings: ScheduleBusinessSettings;
  saving?: boolean;
  onUpdateBusinessSettings: (settings: Partial<ScheduleBusinessSettings>) => void;
  onSave: () => void;
  className?: string;
}

export function BusinessSettings({
  businessSettings,
  saving = false,
  onUpdateBusinessSettings,
  onSave,
  className = ""
}: BusinessSettingsProps) {
  const handleSettingChange = (field: keyof ScheduleBusinessSettings, value: number) => {
    onUpdateBusinessSettings({ [field]: value });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">İş Ayarları</CardTitle>
          <Button
            onClick={onSave}
            disabled={saving}
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appointment Duration */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <Clock className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="appointment-duration" className="text-sm font-medium">
              Randevu Süresi (dakika)
            </Label>
            <Input
              id="appointment-duration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={businessSettings.appointmentDuration}
              onChange={(e) => handleSettingChange('appointmentDuration', parseInt(e.target.value) || 45)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Her randevunun süresi (15-180 dakika arası)
            </p>
          </div>
        </div>

        {/* Reservation Window */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <Calendar className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="reservation-days" className="text-sm font-medium">
              Rezervasyon Penceresi (gün)
            </Label>
            <Input
              id="reservation-days"
              type="number"
              min="1"
              max="30"
              value={businessSettings.reservationDays}
              onChange={(e) => handleSettingChange('reservationDays', parseInt(e.target.value) || 7)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Müşteriler kaç gün önceden randevu alabilir (1-30 gün arası)
            </p>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <AlertTriangle className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="cancellation-hours" className="text-sm font-medium">
              İptal Süresi (saat)
            </Label>
            <Input
              id="cancellation-hours"
              type="number"
              min="1"
              max="48"
              value={businessSettings.cancellationHours}
              onChange={(e) => handleSettingChange('cancellationHours', parseInt(e.target.value) || 2)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Randevudan kaç saat önceye kadar iptal edilebilir (1-48 saat arası)
            </p>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Mevcut Ayarlar</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Randevu Süresi:</span>
              <br />
              <span className="font-medium">{businessSettings.appointmentDuration} dakika</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rezervasyon:</span>
              <br />
              <span className="font-medium">{businessSettings.reservationDays} gün önceden</span>
            </div>
            <div>
              <span className="text-muted-foreground">İptal Süresi:</span>
              <br />
              <span className="font-medium">{businessSettings.cancellationHours} saat öncesine kadar</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}