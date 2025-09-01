import { z } from "zod"

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

// Register form validation schema
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name can be maximum 50 characters")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "First name can only contain letters")
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name can be maximum 50 characters")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Last name can only contain letters")
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Enter a valid email address")
      .toLowerCase(),
    phone: z
      .string()
      .optional()
      .transform((val) => val?.trim() || "")
      .refine(
        (phone) => {
          if (!phone || phone === "") return true;
          // Turkish phone number validation
          const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
          return phoneRegex.test(phone.replace(/\s/g, ""));
        },
        {
          message: "Enter a valid phone number (05XX XXX XX XX)",
        }
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password can be maximum 100 characters")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password must contain at least one number",
      }),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address")
    .toLowerCase(),
})

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password can be maximum 100 characters")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password must contain at least one number",
      }),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Change password form validation schema (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password can be maximum 100 characters")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Password must contain at least one number",
      }),
    confirmNewPassword: z
      .string()
      .min(1, "New password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>