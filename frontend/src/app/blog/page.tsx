import { blogPosts } from "@/lib/data";
import Link from "next/link";
import { Metadata } from "next";
import { Clock, ArrowRight, Tag } from "lucide-react";

export const metadata: Metadata = { title: "Blog", description: "Insights on AI, customer engagement, live chat, and business growth." };

export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><span className="text-white font-bold text-sm">R</span></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></Link><nav className="hidden md:flex items-center gap-6"><Link href="/#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Features</Link><Link href="/blog" className="text-sm text-brand-600 font-medium">Blog</Link><Link href="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Help</Link><Link href="/feedback" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Feedback</Link></nav><Link href="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Sign In</Link></div></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16"><h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Blog</h1><p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Insights on AI, customer engagement, and business growth</p></div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">{categories.map((cat) => (<span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400"><Tag className="w-3 h-3" />{cat}</span>))}</div>

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="group block mb-16">
            <div className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-brand-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="h-64 md:h-auto bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center"><span className="text-6xl opacity-60">📝</span></div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium w-fit mb-4">{featuredPost.category}</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors mb-3">{featuredPost.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{featuredPost.readTime}</span><span>{featuredPost.author}</span><span>{new Date(featuredPost.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                <div className="mt-6 flex items-center gap-2 text-brand-600 font-medium">Read full article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </div>
            </div>
          </Link>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center"><span className="text-4xl opacity-50">📝</span></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3"><span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-medium">{post.category}</span><span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{post.readTime}</span></div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-600">Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">© 2026 Amplizo. All rights reserved.</div></footer>
    </div>
  );
}
