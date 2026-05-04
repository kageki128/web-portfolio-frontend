import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogArticleBySlug, getBlogArticleSlugs } from "@/server/articles/blog";

export const revalidate = 1800;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export async function generateStaticParams() {
  const slugs = await getBlogArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <article className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          <div className="px-8 py-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-400 font-bold text-sm">{article.date}</span>
              <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md bg-cyan-500">
                Blog
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{article.title}</h1>

            <div className="mt-10 space-y-6 text-slate-800 leading-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => {
                    void node;
                    return <h2 className="text-2xl font-black mt-12 mb-4 text-slate-900" {...props} />;
                  },
                  h3: ({ node, ...props }) => {
                    void node;
                    return <h3 className="text-xl font-black mt-10 mb-3 text-slate-900" {...props} />;
                  },
                  p: ({ node, ...props }) => {
                    void node;
                    return <p className="leading-8 text-slate-800" {...props} />;
                  },
                  ul: ({ node, ...props }) => {
                    void node;
                    return <ul className="list-disc pl-6 space-y-2" {...props} />;
                  },
                  ol: ({ node, ...props }) => {
                    void node;
                    return <ol className="list-decimal pl-6 space-y-2" {...props} />;
                  },
                  blockquote: ({ node, ...props }) => {
                    void node;
                    return (
                      <blockquote className="border-l-4 border-cyan-500 bg-cyan-50/60 px-4 py-2 text-slate-700" {...props} />
                    );
                  },
                  code: ({ node, className, ...props }) => {
                    void node;
                    const codeText = String(props.children ?? "");
                    const isInline = !className && !codeText.includes("\n");
                    if (isInline) {
                      return (
                        <code className="bg-slate-100 text-slate-900 rounded px-1.5 py-0.5 text-sm font-medium" {...props} />
                      );
                    }
                    return (
                      <code
                        className={`block bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm ${className}`}
                        {...props}
                      />
                    );
                  },
                  table: ({ node, ...props }) => {
                    void node;
                    return (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-200" {...props} />
                      </div>
                    );
                  },
                  th: ({ node, ...props }) => {
                    void node;
                    return <th className="bg-slate-100 border border-slate-200 px-3 py-2 text-left font-bold" {...props} />;
                  },
                  td: ({ node, ...props }) => {
                    void node;
                    return <td className="border border-slate-200 px-3 py-2" {...props} />;
                  },
                  a: ({ node, href = "", ...props }) => {
                    void node;
                    if (isExternalLink(href)) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 font-semibold underline underline-offset-2 hover:text-cyan-500"
                          {...props}
                        />
                      );
                    }

                    return (
                      <a href={href} className="text-cyan-600 font-semibold underline underline-offset-2 hover:text-cyan-500" {...props} />
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
