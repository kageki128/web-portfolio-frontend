import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogArticleBySlug, getBlogArticleSlugs } from "@/server/articles/blog";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getBlogArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) return {};

  const description = article.description;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: article.link,
    },
    openGraph: {
      type: "article",
      url: article.link,
      title: article.title,
      description,
      images: [article.image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [article.image],
    },
  };
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

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mt-4 mb-8 pb-3 border-b-4 border-cyan-500">
              {article.title}
            </h1>

            <div
              className="article-markdown mt-12 text-slate-600 leading-loose font-medium"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          </article>
        </section>
      </div>
    </div>
  );
}
