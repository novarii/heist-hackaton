import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .transform((value) => value.toLowerCase()),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
