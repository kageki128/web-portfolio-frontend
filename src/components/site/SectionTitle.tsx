export function SectionTitle({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="text-6xl md:text-8xl lg:text-9xl font-black font-heading tracking-widest text-cyan-500/15 uppercase select-none text-center">
        {title}
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <h2 className="translate-y-[0.12em] text-3xl md:text-4xl font-bold font-sans leading-none tracking-widest text-slate-800 text-center">
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
