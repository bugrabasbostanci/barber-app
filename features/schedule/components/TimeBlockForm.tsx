"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Plus, RotateCcw } from "lucide-react";
import { cn, formatTurkishDate, dateToLocalString } from "@/lib/utils";
import { ScheduleFormData, Staff, BlockType } from "../types";

interface TimeBlockFormProps {
  formData: ScheduleFormData;
  staffMembers: Staff[];
  saving?: boolean;
  calendarOpen: boolean;
  onUpdateFormData: (data: Partial<ScheduleFormData>) => void;
  onSetCalendarOpen: (open: boolean) => void;
  onCreateTimeBlock: () => void;
  onResetForm: () => void;
  className?: string;
}

export function TimeBlockForm({
  formData,
  staffMembers,
  saving = false,
  calendarOpen,
  onUpdateFormData,
  onSetCalendarOpen,
  onCreateTimeBlock,
  onResetForm,
  className = ""
}: TimeBlockFormProps) {
  const handleDateSelect = (date: Date | undefined) => {
    onUpdateFormData({ blockDate: date });
    onSetCalendarOpen(false);
  };

  const handleStaffChange = (staffId: string) => {
    onUpdateFormData({ blockStaff: staffId });
  };

  const handleBlockTypeChange = (type: BlockType) => {
    onUpdateFormData({ 
      blockType: type,
      // Clear time fields when switching to full day
      blockStartTime: type === 'full-day' ? '' : formData.blockStartTime,
      blockEndTime: type === 'full-day' ? '' : formData.blockEndTime,
    });
  };

  const handleTimeChange = (field: 'blockStartTime' | 'blockEndTime', value: string) => {
    onUpdateFormData({ [field]: value });
  };

  const handleReasonChange = (value: string) => {
    onUpdateFormData({ blockReason: value });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Zaman Bloğu Ekle</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetForm}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Temizle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Tarih</Label>
          <Popover open={calendarOpen} onOpenChange={onSetCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.blockDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formData.blockDate ? (
                  formatTurkishDate(dateToLocalString(formData.blockDate))
                ) : (
                  "Tarih seçin"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.blockDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Staff Selection */}
        <div className="space-y-2">
          <Label>Personel</Label>
          <Select value={formData.blockStaff} onValueChange={handleStaffChange}>
            <SelectTrigger>
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.firstName} {staff.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Block Type */}
        <div className="space-y-2">
          <Label>Blok Türü</Label>
          <Select 
            value={formData.blockType} 
            onValueChange={(value: BlockType) => handleBlockTypeChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time-range">Saat Aralığı</SelectItem>
              <SelectItem value="full-day">Tüm Gün</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range (only if not full day) */}
        {formData.blockType === 'time-range' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Başlangıç Saati</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.blockStartTime}
                onChange={(e) => handleTimeChange('blockStartTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Bitiş Saati</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.blockEndTime}
                onChange={(e) => handleTimeChange('blockEndTime', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">Sebep</Label>
          <Textarea
            id="reason"
            placeholder="Zaman bloğu sebebini girin..."
            value={formData.blockReason}
            onChange={(e) => handleReasonChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={onCreateTimeBlock}
          disabled={saving}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          {saving ? 'Ekleniyor...' : 'Zaman Bloğu Ekle'}
        </Button>
      </CardContent>
    </Card>
  );
}