export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "TOP", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "WORKS", href: "/works" },
  { label: "INTERESTS", href: "/interests" },
  { label: "ARTICLES", href: "/articles" },
];

export function isPathActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
