import { User } from "@supabase/supabase-js";
import { Role } from "@prisma/client";

// Database user interface - matches Prisma User model
export interface DatabaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

// Extended Supabase user with our database fields
export interface AuthUser extends User {
  role?: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
  isActive?: boolean;
}

// Auth state interface for stores and contexts
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  hydrated: boolean;
}