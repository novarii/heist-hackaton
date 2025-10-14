import type { ReactNode } from "react";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-900 bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between text-sm text-zinc-300">
          <span className="font-semibold text-zinc-100">Heist Console</span>
          <span>Signed in as team@heist.dev</span>
        </div>
      </header>
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
