import { createClient } from '@/lib/supabase/server'

// Server-side auth functions
export async function getServerUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getServerSession() {
  const supabase = await createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}