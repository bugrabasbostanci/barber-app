"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { WorkingHours, WorkingDay } from "../types";

interface WorkingHoursSettingsProps {
  workingHours: WorkingHours;
  saving?: boolean;
  onUpdateWorkingHours: (day: keyof WorkingHours, hours: Partial<WorkingDay>) => void;
  onSave: () => void;
  className?: string;
}

const dayLabels: Record<keyof WorkingHours, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

export function WorkingHoursSettings({
  workingHours,
  saving = false,
  onUpdateWorkingHours,
  onSave,
  className = ""
}: WorkingHoursSettingsProps) {
  const handleDayToggle = (day: keyof WorkingHours, isOpen: boolean) => {
    onUpdateWorkingHours(day, { isOpen });
  };

  const handleTimeChange = (day: keyof WorkingHours, field: 'start' | 'end', value: string) => {
    onUpdateWorkingHours(day, { [field]: value });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
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
      <CardContent className="space-y-4">
        {(Object.keys(workingHours) as Array<keyof WorkingHours>).map((day) => {
          const dayHours = workingHours[day];
          
          return (
            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-20">
                <Label className="text-sm font-medium">
                  {dayLabels[day]}
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={dayHours.isOpen}
                  onCheckedChange={(checked) => handleDayToggle(day, checked)}
                />
                <Label className="text-sm text-muted-foreground">
                  {dayHours.isOpen ? 'Açık' : 'Kapalı'}
                </Label>
              </div>
              
              {dayHours.isOpen && (
                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-start`} className="text-sm">
                      Başlangıç:
                    </Label>
                    <Input
                      id={`${day}-start`}
                      type="time"
                      value={dayHours.start}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-end`} className="text-sm">
                      Bitiş:
                    </Label>
                    <Input
                      id={`${day}-end`}
                      type="time"
                      value={dayHours.end}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}