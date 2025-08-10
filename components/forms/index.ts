// Lazy-loaded form components for better code splitting
import { lazy } from 'react'

// Shared form components
export const PhoneInput = lazy(() => import('./shared/PhoneInput').then(m => ({ default: m.PhoneInput })))
export const StaffSelector = lazy(() => import('./shared/StaffSelector').then(m => ({ default: m.StaffSelector })))
export const DateTimePicker = lazy(() => import('./shared/DateTimePicker').then(m => ({ default: m.DateTimePicker })))
export const CustomerInfoForm = lazy(() => import('./shared/CustomerInfoForm').then(m => ({ default: m.CustomerInfoForm })))

// Appointment forms
export const AppointmentForm = lazy(() => import('./appointment/AppointmentForm').then(m => ({ default: m.AppointmentForm })))

// Re-export non-lazy versions for critical components that need immediate loading
export { PhoneInput as PhoneInputSync } from './shared/PhoneInput'
export { StaffSelector as StaffSelectorSync } from './shared/StaffSelector'
export { DateTimePicker as DateTimePickerSync } from './shared/DateTimePicker'
export { CustomerInfoForm as CustomerInfoFormSync } from './shared/CustomerInfoForm'
export { AppointmentForm as AppointmentFormSync } from './appointment/AppointmentForm'