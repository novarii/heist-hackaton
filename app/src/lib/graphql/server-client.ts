import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/genql";

export function createGraphqlServerClient(accessToken?: string) {
  const env = getServerEnv();

  return createClient({
    url: `${env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ...(env.SUPABASE_SERVICE_ROLE_KEY && {
        Authorization: `Bearer ${accessToken ?? env.SUPABASE_SERVICE_ROLE_KEY}`,
      }),
      ...(!env.SUPABASE_SERVICE_ROLE_KEY && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
  });
}
