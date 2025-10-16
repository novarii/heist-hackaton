import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

let cachedClient: SupabaseClient<Database> | null = null

/**
 * Returns a singleton Supabase client configured with the service-role key.
 * Intended for server-only usage where privileged writes are required.
 */
export function getServiceSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceSupabaseClient must only be called on the server.')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable.')
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return cachedClient
}
