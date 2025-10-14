import { ArrowRight, Database, LayoutTemplate, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Database,
    title: "Supabase Native",
    description:
      "Typed queries, RLS policies, and Edge Functions ready for orchestrating agent tools.",
  },
  {
    icon: LayoutTemplate,
    title: "Shadcn + Radix UI",
    description:
      "Composable primitives with Tailwind + CVA to accelerate building consistent surfaces.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Actions",
    description:
      "next-safe-action wired for type-safe mutations, validation, and client fallbacks.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-16 px-6 py-20 md:gap-20">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Agent Orchestrator Starter
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Ship typed agent workflows with a modern Next.js 15.5 stack.
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Everything you need to prototype Supabase-backed AI experiences: Tailwind,
          Shadcn UI primitives, Genql scaffolding, and testing harnesses.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/docs">
              Explore docs
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="ghost" asChild size="lg">
            <Link href="https://supabase.com" target="_blank" rel="noreferrer">
              Connect Supabase
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-lg border border-border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <feature.icon className="mb-4 size-6 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <NewsletterForm className="w-full max-w-2xl" />
    </main>
  );
}
