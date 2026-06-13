export function SectionTitle({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="relative flex max-w-full items-center justify-center overflow-hidden py-4 text-[clamp(2.75rem,14vw,8rem)] leading-none sm:py-6">
      <div
        data-testid="section-title-background"
        className="max-w-full whitespace-nowrap text-center font-heading text-[1em] font-black tracking-[0.08em] text-brand-500/15 uppercase select-none sm:tracking-widest"
      >
        {title}
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <h2
          data-testid="section-title-foreground"
          className="translate-y-[0.12em] text-center font-sans text-[0.333em] font-bold leading-none tracking-widest text-ink"
        >
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
