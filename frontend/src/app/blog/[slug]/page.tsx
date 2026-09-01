import { blogPosts } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, Tag, Calendar, User, Share2, Bookmark } from "lucide-react";

export async function generateStaticParams() { return blogPosts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date } };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const morePosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><span className="text-white font-bold text-sm">R</span></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></Link><nav className="hidden md:flex items-center gap-6"><Link href="/#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Features</Link><Link href="/blog" className="text-sm text-brand-600 font-medium">Blog</Link><Link href="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Help</Link><Link href="/feedback" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Feedback</Link></nav><Link href="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Sign In</Link></div></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8"><ArrowLeft className="w-4 h-4" />Back to Blog</Link>

        <article>
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium">{post.category}</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" />{post.readTime}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{post.title}</h1>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Share2 className="w-4 h-4" />Share</button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Bookmark className="w-4 h-4" />Save</button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="h-64 sm:h-80 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 rounded-2xl flex items-center justify-center mb-10"><span className="text-6xl opacity-60">📝</span></div>

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3">{paragraph.replace(/\*\*/g, "")}</h2>;
              if (paragraph.startsWith("- ")) return <ul key={i} className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4">{paragraph.split("\n").map((item, j) => <li key={j}>{item.replace("- ", "")}</li>)}</ul>;
              if (paragraph.startsWith("1. ")) return <ol key={i} className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4">{paragraph.split("\n").map((item, j) => <li key={j}>{item.replace(/^\d+\.\s*/, "")}</li>)}</ol>;
              return <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base">{paragraph}</p>;
            })}
          </div>

          {/* Tags */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 flex-wrap"><Tag className="w-4 h-4 text-gray-400" /><span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm">{post.category}</span><span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">AI</span><span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">Customer Engagement</span></div>
          </div>

          {/* Author */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xl">R</div>
            <div><p className="font-semibold text-gray-900 dark:text-gray-100">{post.author}</p><p className="text-sm text-gray-500 dark:text-gray-400">We help businesses grow with AI-powered customer communication platforms.</p></div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{relatedPosts.map((p) => (<Link key={p.slug} href={`/blog/${p.slug}`} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"><div className="h-40 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center"><span className="text-3xl opacity-50">📝</span></div><div className="p-5"><span className="text-xs text-brand-600 font-medium">{p.category}</span><h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors line-clamp-2">{p.title}</h3><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{p.readTime}</p></div></Link>))}</div>
          </div>
        )}

        {/* More Posts */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">More from Amplizo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{morePosts.map((p) => (<Link key={p.slug} href={`/blog/${p.slug}`} className="group flex gap-4 items-start"><div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center shrink-0"><span className="text-2xl opacity-50">📝</span></div><div><span className="text-xs text-brand-600 font-medium">{p.category}</span><h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors text-sm line-clamp-2">{p.title}</h3><span className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{p.readTime}</span></div></Link>))}</div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">© 2026 Amplizo. All rights reserved.</div></footer>
    </div>
  );
}
