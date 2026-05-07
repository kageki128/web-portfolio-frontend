type SiteFooterProps = {
  lastUpdated: string;
};

export function SiteFooter({ lastUpdated }: SiteFooterProps) {
  const copyrightYear = lastUpdated.split("-")[0] ?? "";

  return (
    <footer className="bg-white py-12 border-t border-slate-200 relative">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col items-start gap-2">
          <div className="text-2xl font-black font-heading tracking-tighter text-slate-800">
            kageki128
          </div>
          <p className="text-slate-400 text-sm font-medium">Last Updated: {lastUpdated}</p>
          <p className="text-slate-400 text-sm font-medium">
            &copy; {copyrightYear} kageki128. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
