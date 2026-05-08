import Link from "next/link";

export default function Page() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 rounded-md border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-bold tracking-wider text-white transition-colors hover:bg-black/60"
      >
        TOP
      </Link>
      <main className="h-full w-full p-4 pt-14">
        <div className="h-full w-full rounded-xl border border-white/20 bg-black/20" />
      </main>
    </div>
  );
}
