export function SectionTitle({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="relative flex max-w-full items-center justify-center overflow-hidden py-4 sm:py-6">
      <div className="max-w-full whitespace-nowrap text-center font-heading text-[clamp(2rem,10vw,6rem)] font-black tracking-[0.08em] text-brand-500/15 uppercase select-none sm:tracking-widest">
        {title}
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <h2 className="translate-y-[0.12em] text-center font-sans text-[clamp(1.5rem,6vw,2.25rem)] font-bold leading-none tracking-widest text-ink">
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
