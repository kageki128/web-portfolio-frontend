import type { AboutCareerEntry } from "@/types/about";

export function CareerTimeline({ entries }: { entries: AboutCareerEntry[] }) {
  const entriesByNewest = [...entries].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <ol className="flex flex-col gap-8">
      {entriesByNewest.map((entry, index) => (
        <li
          key={`${entry.startDate}-${entry.company}-${entry.programName}`}
          className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8"
        >
          <p className="pt-0.5 whitespace-nowrap text-sm font-bold tracking-wide text-muted">
            {entry.startDate} 〜 {entry.endDate}
          </p>

          <article
            className={`relative ml-1.5 border-l-2 border-line pb-1 pl-6 sm:ml-0 ${index < entriesByNewest.length - 1 ? "after:absolute after:top-full after:-left-0.5 after:h-17 after:border-l-2 after:border-line sm:after:h-8" : ""}`}
          >
            <span
              aria-hidden
              className="absolute top-1.5 -left-[7px] size-3 rounded-full bg-brand-500 ring-4 ring-brand-50"
            />

            <h4 className="text-lg font-black text-ink">
              {entry.href ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-600"
                >
                  {entry.company}
                </a>
              ) : (
                entry.company
              )}
            </h4>

            <p className="mt-1 font-bold text-ink-soft">
              {entry.programName}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {entry.role}
            </p>
          </article>
        </li>
      ))}
    </ol>
  );
}
