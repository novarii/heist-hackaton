"use client";

import { createClient } from "@/lib/genql";
import { clientEnv } from "@/lib/env";

export function createGraphqlBrowserClient(accessToken?: string) {
  return createClient({
    url: `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    headers: {
      apikey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
