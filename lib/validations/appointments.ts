import { z } from 'zod'

// Common validation schemas
export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^[0-9]{10}$/, 'Enter a valid phone number (5XX XXX XX XX)')
  .refine((phone) => phone.startsWith('5'), {
    message: 'Phone number must start with 5'
  })

export const turkishNameSchema = z.string()
  .min(1, 'This field is required')
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Can be maximum 50 characters')
  .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, 'Only letters are allowed')
  .refine((name) => name.trim().length > 0, {
    message: 'This field is required'
  })

export const emailSchema = z.string()
  .email('Enter a valid email address')
  .optional()
  .or(z.literal(''))

export const requiredEmailSchema = z.string()
  .min(1, 'Email address is required')
  .email('Enter a valid email address')

// Date/Time validation
export const dateSchema = z.date({
  required_error: 'Date selection is required',
  invalid_type_error: 'Select a valid date'
})

export const nullableDateSchema = z.date().nullable()

export const timeSchema = z.string()
  .min(1, 'Time selection is required')
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Enter a valid time format (e.g.: 14:30)')

export const staffIdSchema = z.string()
  .min(1, 'Barber selection is required')
  .uuid('Select a valid barber')

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
    .max(500, 'Notes can be maximum 500 characters')
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
    .max(500, 'Notes can be maximum 500 characters')
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
    .min(1, 'Block reason is required')
    .max(200, 'Block reason can be maximum 200 characters')
}).refine((data) => {
  // Validate that end time is after start time
  const [startHour, startMin] = data.startTime.split(':').map(Number)
  const [endHour, endMin] = data.endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return endMinutes > startMinutes
}, {
  message: 'End time must be after start time',
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