import type { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-slate-950 text-white overflow-hidden">{children}</div>;
}
