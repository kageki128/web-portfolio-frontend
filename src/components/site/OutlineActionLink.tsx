import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { OUTLINE_ACTION_CLASS } from "@/constants/siteStyles";

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
    <Link href={href} className={OUTLINE_ACTION_CLASS}>
      {direction === "left" ? <Icon size={18} /> : null}
      {label}
      {direction === "right" ? <Icon size={18} /> : null}
    </Link>
  );
}
