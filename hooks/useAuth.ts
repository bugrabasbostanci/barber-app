'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { AuthUser } from '@/lib/auth'

interface UserWithRole extends User {
  role?: string;
  firstName?: string;
  lastName?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)  
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const userData = await response.json()
        return userData
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
    return null
  }

  // Detect if user signed in with Google or email
  const detectUserProvider = (user: User) => {
    const identities = user.identities || []
    const hasGoogleIdentity = identities.some(identity => identity.provider === 'google')
    const hasEmailIdentity = identities.some(identity => identity.provider === 'email')
    
    return {
      isGoogleUser: hasGoogleIdentity,
      isEmailUser: hasEmailIdentity && !hasGoogleIdentity // Pure email users (not Google)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userWithRole = await fetchUserRole(session.user.id)
        const providerInfo = detectUserProvider(session.user)
        setUser({ 
          ...session.user, 
          role: userWithRole?.role,
          firstName: userWithRole?.firstName,
          lastName: userWithRole?.lastName,
          ...providerInfo
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userWithRole = await fetchUserRole(session.user.id)
        const providerInfo = detectUserProvider(session.user)
        setUser({ 
          ...session.user, 
          role: userWithRole?.role,
          firstName: userWithRole?.firstName,
          lastName: userWithRole?.lastName,
          ...providerInfo
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return {
    user,
    authUser,
    loading,
    signOut: () => supabase.auth.signOut(),
  }
}