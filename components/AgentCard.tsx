import { formatDistanceToNow } from "date-fns";

type AgentCardProps = {
  name: string;
  summary: string;
  status: string;
  lastRun?: string;
  variant?: "marketing" | "dashboard";
};

const statusTone = {
  marketing: "border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
  dashboard:
    "border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900",
};

export default function AgentCard({
  name,
  summary,
  status,
  lastRun,
  variant = "marketing",
}: AgentCardProps) {
  return (
    <article
      className={`flex h-full flex-col justify-between gap-6 rounded-xl px-5 py-6 text-left transition ${statusTone[variant]}`}
    >
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-50">{name}</h3>
          <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-widest text-zinc-300">
            {status}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{summary}</p>
      </header>
      {lastRun ? (
        <footer className="text-xs text-zinc-500">
          Last run{" "}
          {formatDistanceToNow(new Date(lastRun), {
            addSuffix: true,
          })}
        </footer>
      ) : null}
    </article>
  );
}
