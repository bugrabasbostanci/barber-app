import { z } from "zod"

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi girin")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Şifre gereklidir")
    .min(6, "Şifre en az 6 karakter olmalıdır"),
})

// Register form validation schema
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ad gereklidir")
      .min(2, "Ad en az 2 karakter olmalıdır")
      .max(50, "Ad en fazla 50 karakter olabilir")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harf içerebilir")
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, "Soyad gereklidir")
      .min(2, "Soyad en az 2 karakter olmalıdır")
      .max(50, "Soyad en fazla 50 karakter olabilir")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harf içerebilir")
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, "E-posta adresi gereklidir")
      .email("Geçerli bir e-posta adresi girin")
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
          message: "Geçerli bir telefon numarası girin (05XX XXX XX XX)",
        }
      ),
    password: z
      .string()
      .min(1, "Şifre gereklidir")
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(100, "Şifre en fazla 100 karakter olabilir")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Şifre en az bir büyük harf içermelidir",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Şifre en az bir küçük harf içermelidir",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Şifre en az bir rakam içermelidir",
      }),
    confirmPassword: z
      .string()
      .min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi girin")
    .toLowerCase(),
})

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Şifre gereklidir")
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(100, "Şifre en fazla 100 karakter olabilir")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Şifre en az bir büyük harf içermelidir",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Şifre en az bir küçük harf içermelidir",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Şifre en az bir rakam içermelidir",
      }),
    confirmPassword: z
      .string()
      .min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })

// Change password form validation schema (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Mevcut şifre gereklidir"),
    newPassword: z
      .string()
      .min(1, "Yeni şifre gereklidir")
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(100, "Şifre en fazla 100 karakter olabilir")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Şifre en az bir büyük harf içermelidir",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Şifre en az bir küçük harf içermelidir",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Şifre en az bir rakam içermelidir",
      }),
    confirmNewPassword: z
      .string()
      .min(1, "Yeni şifre tekrarı gereklidir"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifreden farklı olmalıdır",
    path: ["newPassword"],
  })

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>