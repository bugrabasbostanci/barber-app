// Re-export all profile stores from a single entry point
export { 
  useProfileDataStore, 
  type UserProfile 
} from "./data-store";

export { 
  useProfileEditStore, 
  type ProfileFormData 
} from "./edit-store";

export { 
  useProfileUIStore 
} from "./ui-store";

// Re-export validation utilities
export {
  validatePhone,
  validateName,
  validateEmail,
  formatNameInput,
  formatPhoneInput
} from "@/lib/utils/profile-validation";