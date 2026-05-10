import type { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-disable-scrollbar-gutter
      className="min-h-dvh bg-(--otoge-black) text-(--otoge-white) overflow-hidden"
    >
      {children}
    </div>
  );
}
