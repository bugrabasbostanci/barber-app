import { createClient } from '@/lib/supabase/client'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role: Role
  isActive: boolean
}

// Client-side auth functions only
export async function signUp(email: string, password: string, userData: {
  firstName: string
  lastName: string
  phone?: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: 'CUSTOMER'
      }
    }
  })
  
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Role checking utilities
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    CUSTOMER: 0,
    EMPLOYEE: 1,
    BARBER: 2,
    ADMIN: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function isCustomer(role: Role): boolean {
  return role === 'CUSTOMER'
}

export function isStaff(role: Role): boolean {
  return ['EMPLOYEE', 'BARBER', 'ADMIN'].includes(role)
}

export function isBarber(role: Role): boolean {
  return ['BARBER', 'ADMIN'].includes(role)
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN'
}
