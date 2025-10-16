import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-zinc-100">Create your workspace</h1>
      <p className="mt-4 text-zinc-300">
        Onboarding guides you through connecting Supabase, configuring environments,
        and seeding your first agent workflow.
      </p>
      <div className="mt-10 flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-medium text-zinc-100">Supabase integration</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Provide your project reference, publishable key, and secret key through
            environment variables to unlock migrations and edge functions.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-medium text-zinc-100">Agent blueprint</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Choose a starter template or design a custom plan. Or skip for now and
            you can configure an agent after signup.
          </p>
        </div>
      </div>
      <div className="mt-10 flex gap-3">
        <Link
          href="/agents"
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
        >
          Continue
        </Link>
        <Link
          href="/landing"
          className="rounded-md border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
