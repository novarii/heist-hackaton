import Link from "next/link";
import AgentCard from "components/AgentCard";
import PromptInput from "components/PromptInput";

const demoAgents = [
  {
    name: "Research Scout",
    summary: "Aggregates market signals and compiles a daily competitive brief.",
    status: "In beta",
  },
  {
    name: "Support Scribe",
    summary: "Triages inbound tickets and drafts responses approved by humans.",
    status: "Production",
  },
  {
    name: "Growth Navigator",
    summary: "Orchestrates outbound campaigns with multi-channel follow-ups.",
    status: "Prototype",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 lg:px-8">
      <section className="flex flex-col gap-8">
        <div className="space-y-6">
          <span className="inline-flex w-fit items-center rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
            Agents orchestrated with Supabase
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Ship composable AI agents with production guardrails built in.
          </h1>
          <p className="max-w-2xl text-base text-zinc-300 md:text-lg">
            Spin up orchestrators, manage tool telemetry, and connect to your stack
            in minutes. Heist gives product teams the velocity of prototypes with
            the governance of enterprise platforms.
          </p>
        </div>
        <PromptInput
          label="Ask the builder"
          placeholder="What can I automate with Heist?"
          submitLabel="Generate workflow"
          onSubmit={async (prompt) => {
            console.log("Prompt submitted:", prompt);
          }}
        />
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>No credit card required</span>
          <span>—</span>
          <span>Templates for RAG, support, and growth agents</span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoAgents.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            summary={agent.summary}
            status={agent.status}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Ready to build?</h2>
            <p className="max-w-xl text-zinc-300">
              Create an account to provision Supabase projects, sync prompts, and
              manage execution telemetry.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/onboarding"
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
            >
              Launch console
            </Link>
            <Link
              href="/agents"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500"
            >
              Explore agents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
