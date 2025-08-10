"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useSchedule } from "../hooks/useSchedule";
import { WorkingHoursSettings } from "./WorkingHoursSettings";
import { BusinessSettings } from "./BusinessSettings";
import { TimeBlockForm } from "./TimeBlockForm";
import { TimeBlocksList } from "./TimeBlocksList";

interface ScheduleContainerProps {
  className?: string;
}

export function ScheduleContainer({ className = "" }: ScheduleContainerProps) {
  const {
    // State
    blockedTimes,
    staffMembers,
    workingHours,
    businessSettings,
    loading,
    saving,
    formData,
    showDeleteDialog,
    showValidationDialog,
    validationMessage,
    calendarOpen,
    
    // Actions
    updateFormData,
    resetForm,
    closeDeleteDialog,
    hideValidation,
    setCalendarOpen,
    updateWorkingHours,
    updateBusinessSettings,
    handleCreateTimeBlock,
    handleDeleteTimeBlock,
    handleSaveWorkingHours,
    handleSaveBusinessSettings,
    getStaffName,
  } = useSchedule();

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/barber/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Geri Dön
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Çizelge Yönetimi</h1>
              <p className="text-muted-foreground">
                Çalışma saatlerini, iş ayarlarını ve zaman bloklarını yönetin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-8">
            {/* Working Hours */}
            <WorkingHoursSettings
              workingHours={workingHours}
              saving={saving}
              onUpdateWorkingHours={updateWorkingHours}
              onSave={handleSaveWorkingHours}
            />

            {/* Business Settings */}
            <BusinessSettings
              businessSettings={businessSettings}
              saving={saving}
              onUpdateBusinessSettings={updateBusinessSettings}
              onSave={handleSaveBusinessSettings}
            />
          </div>

          {/* Right Column - Time Blocks */}
          <div className="space-y-8">
            {/* Add Time Block Form */}
            <TimeBlockForm
              formData={formData}
              staffMembers={staffMembers}
              saving={saving}
              calendarOpen={calendarOpen}
              onUpdateFormData={updateFormData}
              onSetCalendarOpen={setCalendarOpen}
              onCreateTimeBlock={handleCreateTimeBlock}
              onResetForm={resetForm}
            />

            {/* Blocked Times List */}
            <TimeBlocksList
              blockedTimes={blockedTimes}
              loading={loading}
              onDeleteTimeBlock={(id) => {
                // This will be handled by the delete dialog
                handleDeleteTimeBlock();
              }}
              getStaffName={getStaffName}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaman Bloğunu Sil</DialogTitle>
            <DialogDescription>
              Bu zaman bloğunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTimeBlock}
              disabled={saving}
            >
              {saving ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={hideValidation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doğrulama Hatası</DialogTitle>
            <DialogDescription>
              {validationMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={hideValidation}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}