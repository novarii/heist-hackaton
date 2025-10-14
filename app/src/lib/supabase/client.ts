"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { clientEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseBrowserClient() {
  return createClientComponentClient<Database>({
    supabaseUrl: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
