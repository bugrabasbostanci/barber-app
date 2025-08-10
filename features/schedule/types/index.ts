// Schedule management types

export interface WorkingDay {
  isOpen: boolean;
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export interface ScheduleBusinessSettings {
  appointmentDuration: number; // minutes
  reservationDays: number;     // days ahead
  cancellationHours: number;   // hours before
}

export interface TimeBlock {
  id: string;
  date: string;        // YYYY-MM-DD
  startTime?: string | null; // HH:MM format
  endTime?: string | null;   // HH:MM format
  reason: string;
  isFullDay: boolean;
  staffId: string;
  staffName?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export type BlockType = 'time-range' | 'full-day';

export interface ScheduleFormData {
  blockDate?: Date;
  blockStaff: string;
  blockType: BlockType;
  blockStartTime: string;
  blockEndTime: string;
  blockReason: string;
}

export interface ScheduleState {
  // Data
  blockedTimes: TimeBlock[];
  staffMembers: Staff[];
  workingHours: WorkingHours;
  businessSettings: ScheduleBusinessSettings;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  
  // Form state
  formData: ScheduleFormData;
  
  // Modal states
  showDeleteDialog: boolean;
  blockToDelete: string | null;
  showValidationDialog: boolean;
  validationMessage: string;
  calendarOpen: boolean;
}

export interface ScheduleActions {
  // Data actions
  fetchBlockedTimes: () => Promise<void>;
  fetchStaffMembers: () => Promise<void>;
  saveWorkingHours: () => Promise<void>;
  saveBusinessSettings: () => Promise<void>;
  
  // Time block actions
  createTimeBlock: (block: Omit<TimeBlock, 'id'>) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<void>;
  
  // Form actions
  updateFormData: (data: Partial<ScheduleFormData>) => void;
  resetForm: () => void;
  
  // Modal actions
  openDeleteDialog: (blockId: string) => void;
  closeDeleteDialog: () => void;
  showValidation: (message: string) => void;
  hideValidation: () => void;
  
  // Settings actions
  updateWorkingHours: (day: keyof WorkingHours, hours: Partial<WorkingDay>) => void;
  updateBusinessSettings: (settings: Partial<ScheduleBusinessSettings>) => void;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}