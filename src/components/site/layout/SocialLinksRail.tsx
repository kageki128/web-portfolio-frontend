import { ICON_ACTION_CLASS } from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
import { SOCIAL_LINKS, type SocialLink } from "./socialLinks";

function SocialLinkButton({ link }: { link: SocialLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        ICON_ACTION_CLASS,
        "h-14 w-14 text-white shadow-floating hover:scale-110",
      )}
      style={{ backgroundColor: link.backgroundColor }}
      aria-label={link.label}
      title={link.title ?? link.label}
    >
      {link.icon}
    </a>
  );
}

export function SocialLinksRail() {
  return (
    <div className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
      {SOCIAL_LINKS.map((link) => (
        <SocialLinkButton key={link.label} link={link} />
      ))}
    </div>
  );
}
