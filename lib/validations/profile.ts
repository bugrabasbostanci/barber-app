import { z } from 'zod'
import { phoneSchema, turkishNameSchema, emailSchema, timeSchema } from './appointments'

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
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name can be maximum 100 characters')
    .optional(),
  address: z.string()
    .max(200, 'Address can be maximum 200 characters')
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
  message: 'For open days, start and end times must be specified, and end time must be after start time'
})

// Type exports
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type BarberProfileFormData = z.infer<typeof barberProfileFormSchema>
export type WorkingHoursData = z.infer<typeof workingHoursSchema>