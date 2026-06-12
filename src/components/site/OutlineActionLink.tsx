import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const OUTLINE_ACTION_LINK_CLASS =
  "inline-flex items-center justify-center gap-3 rounded-full border-2 border-body/40 px-8 py-3.5 text-sm font-bold tracking-widest text-body transition-all hover:border-brand-500 hover:text-brand-500 hover:shadow-lg hover:shadow-brand-500/10";

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
