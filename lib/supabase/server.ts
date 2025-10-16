import { createServerClient, type SupabaseClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from './database.types'

/**
 * Creates a scoped Supabase client that keeps the GoTrue session in sync with Next.js cookies.
 * Mirrors Supabase's 2025 App Router guidance for @supabase/ssr clients.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable.')
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /**
           * Server Components can't mutate cookies directly; middleware should refresh sessions.
           * The official Supabase docs treat this as a noop, so swallow the error.
           */
        }
      },
    },
  })
}
