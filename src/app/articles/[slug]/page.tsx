import { notFound } from "next/navigation";
import Link from "next/link";
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

function MarkdownHeadingLevel4(props: React.ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className="text-lg md:text-xl font-black text-cyan-600 mt-10 mb-4"
      {...props}
    />
  );
}

function MarkdownHeadingLevel5(props: React.ComponentPropsWithoutRef<"h5">) {
  return <h5 className="text-base font-black text-cyan-600 mt-8 mb-3 tracking-wide" {...props} />;
}

function MarkdownHeadingLevel6(props: React.ComponentPropsWithoutRef<"h6">) {
  return <h6 className="text-sm font-bold text-cyan-700 mt-6 mb-2 tracking-wider uppercase" {...props} />;
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
      <div className="max-w-6xl mx-auto px-6">
        <section className="mb-32">
          <article>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-400 font-bold text-sm">{article.date}</span>
              <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md bg-cyan-500">
                Blog
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mt-20 mb-8 pb-3 border-b-4 border-cyan-500">
              {article.title}
            </h1>

            <div className="mt-12 space-y-6 text-slate-600 leading-loose font-medium">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => {
                    void node;
                    return (
                      <h1
                        className="text-3xl md:text-4xl font-black text-slate-800 mt-20 mb-8 pb-3 border-b-4 border-cyan-500"
                        {...props}
                      />
                    );
                  },
                  h2: ({ node, ...props }) => {
                    void node;
                    return (
                      <h2
                        className="text-2xl md:text-3xl font-black text-slate-800 mt-16 mb-8 inline-block border-b-4 border-cyan-500 pb-2"
                        {...props}
                      />
                    );
                  },
                  h3: ({ node, ...props }) => {
                    void node;
                    return (
                      <h3 className="text-xl font-black text-slate-800 mt-12 mb-4 flex items-center gap-3" {...props}>
                        <span className="w-1.5 h-6 bg-cyan-500 inline-block" />
                        {props.children}
                      </h3>
                    );
                  },
                  h4: ({ node, ...props }) => {
                    void node;
                    return <MarkdownHeadingLevel4 {...props} />;
                  },
                  h5: ({ node, ...props }) => {
                    void node;
                    return <MarkdownHeadingLevel5 {...props} />;
                  },
                  h6: ({ node, ...props }) => {
                    void node;
                    return <MarkdownHeadingLevel6 {...props} />;
                  },
                  p: ({ node, ...props }) => {
                    void node;
                    return <p className="text-slate-600 leading-loose font-medium my-5" {...props} />;
                  },
                  ul: ({ node, ...props }) => {
                    void node;
                    return <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-cyan-500 my-5" {...props} />;
                  },
                  ol: ({ node, ...props }) => {
                    void node;
                    return (
                      <ol className="list-decimal pl-6 space-y-2 text-slate-600 marker:text-cyan-600 font-semibold my-5" {...props} />
                    );
                  },
                  li: ({ node, ...props }) => {
                    void node;
                    return <li className="pl-1" {...props} />;
                  },
                  blockquote: ({ node, ...props }) => {
                    void node;
                    return (
                      <blockquote
                        className="border-l-4 border-cyan-500 bg-cyan-50 px-5 py-4 text-slate-700 font-medium rounded-r-lg my-8"
                        {...props}
                      />
                    );
                  },
                  hr: ({ node, ...props }) => {
                    void node;
                    return <hr className="border-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-10" {...props} />;
                  },
                  strong: ({ node, ...props }) => {
                    void node;
                    return <strong className="text-slate-800 font-black" {...props} />;
                  },
                  em: ({ node, ...props }) => {
                    void node;
                    return <em className="text-cyan-700 font-semibold not-italic" {...props} />;
                  },
                  del: ({ node, ...props }) => {
                    void node;
                    return <del className="text-slate-400" {...props} />;
                  },
                  pre: ({ node, ...props }) => {
                    void node;
                    return (
                      <pre
                        className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm border border-slate-700 my-6"
                        {...props}
                      />
                    );
                  },
                  code: ({ node, className, ...props }) => {
                    void node;
                    const codeText = String(props.children ?? "");
                    const isInline = !className && !codeText.includes("\n");
                    if (isInline) {
                      return (
                        <code
                          className="bg-slate-100 text-slate-900 rounded px-1.5 py-0.5 text-sm font-medium"
                          {...props}
                        />
                      );
                    }
                    return <code className={className ?? ""} {...props} />;
                  },
                  table: ({ node, ...props }) => {
                    void node;
                    return (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm my-8">
                        <table className="min-w-full text-sm" {...props} />
                      </div>
                    );
                  },
                  thead: ({ node, ...props }) => {
                    void node;
                    return <thead className="bg-slate-50" {...props} />;
                  },
                  th: ({ node, ...props }) => {
                    void node;
                    return <th className="border-b border-slate-200 px-4 py-2.5 text-left font-black text-slate-800" {...props} />;
                  },
                  td: ({ node, ...props }) => {
                    void node;
                    return <td className="border-t border-slate-100 px-4 py-2.5 text-slate-600" {...props} />;
                  },
                  input: ({ node, type, ...props }) => {
                    void node;
                    if (type === "checkbox") {
                      return (
                        <input
                          type="checkbox"
                          className="mr-2 accent-cyan-500 align-middle size-4"
                          {...props}
                        />
                      );
                    }
                    return <input type={type} {...props} />;
                  },
                  img: ({ node, src = "", alt = "", title }) => {
                    void node;
                    return (
                      <>
                        {/* Markdown画像は記事側でサイズが不定なためimgでそのまま描画する */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={alt}
                          className="block w-full rounded-2xl border border-slate-200 shadow-xl object-cover my-8"
                        />
                        {(title ?? alt) && (
                          <span className="block -mt-4 mb-8 text-xs font-semibold tracking-wide text-slate-500">
                            {title ?? alt}
                          </span>
                        )}
                      </>
                    );
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
                      <Link
                        href={href}
                        className="text-cyan-600 font-semibold underline underline-offset-2 hover:text-cyan-500"
                      >
                        {props.children}
                      </Link>
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
