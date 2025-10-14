import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import type { Database } from "@/lib/supabase/types";

export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({
    cookies,
  });
}
