import { z } from 'zod'

// Turkish phone number validation
export const phoneSchema = z.string()
  .min(1, 'Telefon numarası gereklidir')
  .regex(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)')
  .refine((phone) => phone.startsWith('5'), {
    message: 'Telefon numarası 5 ile başlamalıdır'
  })

// Turkish name validation (supports Turkish characters)
export const turkishNameSchema = z.string()
  .min(1, 'Bu alan gereklidir')
  .min(2, 'En az 2 karakter olmalıdır')
  .max(50, 'En fazla 50 karakter olabilir')
  .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, 'Sadece harfler kullanabilirsiniz')
  .refine((name) => name.trim().length > 0, {
    message: 'Bu alan gereklidir'
  })

// Email validation
export const emailSchema = z.string()
  .email('Geçerli bir e-posta adresi giriniz')
  .optional()
  .or(z.literal(''))

// Required email validation
export const requiredEmailSchema = z.string()
  .min(1, 'E-posta adresi gereklidir')
  .email('Geçerli bir e-posta adresi giriniz')

// Password validation
export const passwordSchema = z.string()
  .min(6, 'Şifre en az 6 karakter olmalıdır')
  .max(50, 'Şifre en fazla 50 karakter olabilir')

// Date validation
export const dateSchema = z.date({
  required_error: 'Tarih seçimi gereklidir',
  invalid_type_error: 'Geçerli bir tarih seçiniz'
})

// Nullable date for form state
export const nullableDateSchema = z.date().nullable()

// Time validation (HH:MM format)
export const timeSchema = z.string()
  .min(1, 'Saat seçimi gereklidir')
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (ÖR: 14:30)')

// Staff ID validation
export const staffIdSchema = z.string()
  .min(1, 'Berber seçimi gereklidir')
  .uuid('Geçerli bir berber seçiniz')

// Customer info schema
export const customerInfoSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: emailSchema
})

// Required customer info schema
export const requiredCustomerInfoSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: requiredEmailSchema
})

// Appointment form schema for validation (strict)
export const appointmentFormSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  staffId: staffIdSchema,
  customer: customerInfoSchema,
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
})

// Appointment form state schema (allows nulls)
export const appointmentFormStateSchema = z.object({
  date: nullableDateSchema,
  time: z.string(),
  staffId: z.string(),
  customer: customerInfoSchema,
  notes: z.string().optional()
})

// Manual appointment form schema (for barber use)
export const manualAppointmentFormSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  staffId: staffIdSchema,
  customer: requiredCustomerInfoSchema,
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
})

// Manual appointment form state schema (allows nulls)
export const manualAppointmentFormStateSchema = z.object({
  date: nullableDateSchema,
  time: z.string(),
  staffId: z.string(),
  customer: requiredCustomerInfoSchema,
  notes: z.string().optional()
})

// Time blocking form schema
export const timeBlockingFormSchema = z.object({
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  staffId: staffIdSchema,
  reason: z.string()
    .min(1, 'Blokaj nedeni gereklidir')
    .max(200, 'Blokaj nedeni en fazla 200 karakter olabilir')
}).refine((data) => {
  // Validate that end time is after start time
  const [startHour, startMin] = data.startTime.split(':').map(Number)
  const [endHour, endMin] = data.endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return endMinutes > startMinutes
}, {
  message: 'Bitiş saati başlangıç saatinden sonra olmalıdır',
  path: ['endTime']
})

// Profile form schema
export const profileFormSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: emailSchema
})

// Barber profile form schema
export const barberProfileFormSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  businessName: z.string()
    .min(2, 'İşletme adı en az 2 karakter olmalıdır')
    .max(100, 'İşletme adı en fazla 100 karakter olabilir')
    .optional(),
  address: z.string()
    .max(200, 'Adres en fazla 200 karakter olabilir')
    .optional()
})

// Working hours schema
export const workingHoursSchema = z.object({
  monday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  tuesday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  wednesday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  thursday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  friday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  saturday: z.object({
    isOpen: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  }),
  sunday: z.object({
    isOpen: z.boolean().default(false), // Sundays are closed by default
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional()
  })
}).refine((data) => {
  // Validate that each day has consistent start/end times if open
  const days = Object.entries(data)
  for (const [, hours] of days) {
    if (hours.isOpen) {
      if (!hours.startTime || !hours.endTime) {
        return false
      }
      // Validate start time is before end time
      const [startHour, startMin] = hours.startTime.split(':').map(Number)
      const [endHour, endMin] = hours.endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      if (endMinutes <= startMinutes) {
        return false
      }
    }
  }
  return true
}, {
  message: 'Açık günlerde başlangıç ve bitiş saatleri belirtilmeli, bitiş saati başlangıçtan sonra olmalıdır'
})

// Auth schemas
export const loginSchema = z.object({
  email: requiredEmailSchema,
  password: z.string().min(1, 'Şifre gereklidir')
})

export const registerSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  email: requiredEmailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
})

export const passwordResetSchema = z.object({
  email: requiredEmailSchema
})

export const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
})

// Type exports for use in components
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type RequiredCustomerInfo = z.infer<typeof requiredCustomerInfoSchema>
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>
export type AppointmentFormState = z.infer<typeof appointmentFormStateSchema>
export type ManualAppointmentFormData = z.infer<typeof manualAppointmentFormSchema>
export type ManualAppointmentFormState = z.infer<typeof manualAppointmentFormStateSchema>
export type TimeBlockingFormData = z.infer<typeof timeBlockingFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type BarberProfileFormData = z.infer<typeof barberProfileFormSchema>
export type WorkingHoursData = z.infer<typeof workingHoursSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>