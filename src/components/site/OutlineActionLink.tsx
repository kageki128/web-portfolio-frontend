import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const OUTLINE_ACTION_LINK_CLASS =
  "inline-flex items-center justify-center gap-3 rounded-full border-2 border-slate-600/40 px-8 py-3.5 text-sm font-bold tracking-widest text-slate-600 transition-all hover:border-cyan-500 hover:text-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10";

type OutlineActionLinkProps = {
  href: string;
  label: string;
  direction?: "left" | "right";
};

export function OutlineActionLink({
  href,
  label,
  direction = "right",
}: OutlineActionLinkProps) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;

  return (
    <Link href={href} className={OUTLINE_ACTION_LINK_CLASS}>
      {direction === "left" ? <Icon size={18} /> : null}
      {label}
      {direction === "right" ? <Icon size={18} /> : null}
    </Link>
  );
}
