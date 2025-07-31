'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor')
    }
  }, [user, loading, router])

  return { user, loading }
}

export function useRequireCustomer() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor')
      } else if (user.role !== 'CUSTOMER') {
        router.push('/?error=Bu sayfaya erişim yetkiniz bulunmuyor')
      }
    }
  }, [user, loading, router])

  return { user, loading, isAuthorized: user?.role === 'CUSTOMER' }
}

export function useRequireBarber() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor')
      } else if (user.role !== 'BARBER' && user.role !== 'ADMIN') {
        router.push('/?error=Bu sayfaya erişim yetkiniz bulunmuyor')
      }
    }
  }, [user, loading, router])

  return { user, loading, isAuthorized: user?.role === 'BARBER' || user?.role === 'ADMIN' }
}