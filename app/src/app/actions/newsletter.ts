"use server";

import { revalidatePath } from "next/cache";

import { safeAction } from "@/lib/actions/safe-action";
import { newsletterSchema } from "@/lib/validation/forms";

export const subscribeToNewsletter = safeAction
  .schema(newsletterSchema)
  .action(async ({ parsedInput }) => {
    // TODO: persist the subscription in Supabase or trigger an email workflow.
    console.info("[newsletter] subscribed:", parsedInput.email);

    revalidatePath("/");

    return {
      success: true,
    } as const;
  });
