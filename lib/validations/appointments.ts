import { z } from 'zod'

// Common validation schemas
export const phoneSchema = z.string()
  .min(1, 'Telefon numarası gereklidir')
  .regex(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)')
  .refine((phone) => phone.startsWith('5'), {
    message: 'Telefon numarası 5 ile başlamalıdır'
  })

export const turkishNameSchema = z.string()
  .min(1, 'Bu alan gereklidir')
  .min(2, 'En az 2 karakter olmalıdır')
  .max(50, 'En fazla 50 karakter olabilir')
  .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, 'Sadece harfler kullanabilirsiniz')
  .refine((name) => name.trim().length > 0, {
    message: 'Bu alan gereklidir'
  })

export const emailSchema = z.string()
  .email('Geçerli bir e-posta adresi giriniz')
  .optional()
  .or(z.literal(''))

export const requiredEmailSchema = z.string()
  .min(1, 'E-posta adresi gereklidir')
  .email('Geçerli bir e-posta adresi giriniz')

// Date/Time validation
export const dateSchema = z.date({
  required_error: 'Tarih seçimi gereklidir',
  invalid_type_error: 'Geçerli bir tarih seçiniz'
})

export const nullableDateSchema = z.date().nullable()

export const timeSchema = z.string()
  .min(1, 'Saat seçimi gereklidir')
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (ÖR: 14:30)')

export const staffIdSchema = z.string()
  .min(1, 'Berber seçimi gereklidir')
  .uuid('Geçerli bir berber seçiniz')

// Customer schemas
export const customerInfoSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: emailSchema
})

export const requiredCustomerInfoSchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  phone: phoneSchema,
  email: requiredEmailSchema
})

// Appointment validation schemas
export const appointmentFormSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  staffId: staffIdSchema,
  customer: customerInfoSchema,
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
})

export const appointmentFormStateSchema = z.object({
  date: nullableDateSchema,
  time: z.string(),
  staffId: z.string(),
  customer: customerInfoSchema,
  notes: z.string().optional()
})

export const manualAppointmentFormSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  staffId: staffIdSchema,
  customer: requiredCustomerInfoSchema,
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
})

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

// Type exports
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type RequiredCustomerInfo = z.infer<typeof requiredCustomerInfoSchema>
export type AppointmentForm = z.infer<typeof appointmentFormSchema>
export type AppointmentFormData = z.infer<typeof appointmentFormSchema> // Backward compatibility
export type AppointmentFormState = z.infer<typeof appointmentFormStateSchema>
export type ManualAppointmentForm = z.infer<typeof manualAppointmentFormSchema>
export type ManualAppointmentFormData = z.infer<typeof manualAppointmentFormSchema>
export type ManualAppointmentFormState = z.infer<typeof manualAppointmentFormStateSchema>
export type TimeBlockingFormData = z.infer<typeof timeBlockingFormSchema>