type SiteFooterProps = {
  lastUpdated: string;
};

const BLOB_CREDITS = [
  {
    label: "ablobreach by Nicasi17",
    href: "https://emoji.gg/emoji/9359_ablobreach",
    license: "CC BY 4.0",
  },
  {
    label: "partyblob by Necrozma",
    href: "https://emoji.gg/emoji/partyblob",
    license: "emoji.gg Basic License",
  },
] as const;

export function SiteFooter({ lastUpdated }: SiteFooterProps) {
  const copyrightYear = lastUpdated.split("-")[0] ?? "";

  return (
    <footer className="bg-surface py-12 border-t border-line relative">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col items-start gap-2">
          <div className="text-2xl font-black font-heading tracking-tighter text-ink">
            kageki128
          </div>
          <p className="text-subtle text-sm font-medium">Last Updated: {lastUpdated}</p>
          <p className="text-subtle text-sm font-medium">
            &copy; {copyrightYear} kageki128. All rights reserved, except where otherwise noted.
          </p>
          <p className="text-subtle text-xs font-medium">
            Blob emoji credits:{" "}
            {BLOB_CREDITS.map((credit, index) => (
              <span key={credit.href}>
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-faint underline-offset-4 transition-colors hover:text-brand-600"
                >
                  {credit.label}
                </a>{" "}
                ({credit.license})
                {index < BLOB_CREDITS.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
