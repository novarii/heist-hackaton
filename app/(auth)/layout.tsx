import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <main className="flex flex-1 items-center justify-center">{children}</main>
    </div>
  );
}
