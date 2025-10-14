import Link from "next/link";
import AgentCard from "components/AgentCard";

const agents = [
  {
    name: "Research Scout",
    summary: "Runs nightly crawlers across target domains and pushes findings to Notion.",
    status: "Healthy",
    lastRun: "2024-05-21T03:00:00.000Z",
  },
  {
    name: "Support Scribe",
    summary: "Summarises tickets and drafts replies for human approval inside Zendesk.",
    status: "Action required",
    lastRun: "2024-05-20T18:42:00.000Z",
  },
];

export default function AgentsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100">Agents</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Monitor agent health, review tool usage, and tune prompting strategies.
          </p>
        </div>
        <Link
          href="#"
          className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
        >
          New agent
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            summary={agent.summary}
            status={agent.status}
            lastRun={agent.lastRun}
            variant="dashboard"
          />
        ))}
      </div>
    </div>
  );
}
