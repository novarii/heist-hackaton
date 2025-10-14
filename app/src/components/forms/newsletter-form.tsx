"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { useMemo } from "react";

import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type NewsletterInput,
  newsletterSchema,
} from "@/lib/validation/forms";

export function NewsletterForm({ className }: { className?: string }) {
  const form = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const {
    execute,
    result,
    status,
    reset: resetActionState,
  } = useAction(subscribeToNewsletter, {
    onSuccess: () => {
      form.reset();
    },
  });

  const isSubmitting = status === "executing";

  const globalError = useMemo(() => {
    if (result?.validationErrors?._errors?.length) {
      return result.validationErrors._errors[0];
    }

    if (result?.serverError) {
      return result.serverError;
    }

    if (result?.data?.success) {
      return "Thanks! You're on the list.";
    }

    return null;
  }, [result]);

  return (
    <form
      className={cn(
        "grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:gap-2",
        className,
      )}
      onSubmit={form.handleSubmit(async (values) => {
        resetActionState();
        await execute(values);
      })}
    >
      <div className="grid gap-1">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="email"
        >
          Join the waitlist
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={cn(
            "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            form.formState.errors.email && "border-destructive focus-visible:ring-destructive",
          )}
          {...form.register("email")}
        />
        <p className="min-h-5 text-xs text-muted-foreground">
          {form.formState.errors.email?.message ?? globalError ?? "Be the first to know when we launch."}
        </p>
      </div>
      <Button
        className="self-end"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending..." : "Notify me"}
      </Button>
    </form>
  );
}
