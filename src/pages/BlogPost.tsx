import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Search,
  ArrowRight,
  Tag,
  Mail,
  Compass,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { blogService, type Blog as BlogPostT } from "@/api/services/blogService";
import { categoryService } from "@/api/services/categoryService";
import { cn } from "@/lib/utils";
import { MagadhExploraLogo } from "@/assets/assets";

const dateLocale = (lang: string) =>
  lang === "zh" ? "zh-CN" :
  lang === "ja" ? "ja-JP" :
  lang === "hi" ? "hi-IN" :
  lang === "th" ? "th-TH" :
  lang === "vi" ? "vi-VN" :
  lang === "si" ? "si-LK" :
  "en-US";

/** Rough read-time from HTML body (200 words/min). */
function readMinutes(html?: string): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const postQ = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogService.get(slug!),
    enabled: !!slug,
  });

  const allBlogsQ = useQuery({
    queryKey: ["blogs", "public"],
    queryFn: blogService.list,
  });

  const categoriesQ = useQuery({
    queryKey: ["categories", "public"],
    queryFn: () => categoryService.list(),
  });

  const [searchValue, setSearchValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const post = postQ.data;
  const popularPosts = (allBlogsQ.data ?? [])
    .filter((p) => p.slug !== slug)
    .slice(0, 4);
  const themes = (categoriesQ.data ?? [])
    .filter((c) => c.active)
    .slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/blog?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.trim()) return;
    toast({
      title: "Subscribed!",
      description: "We'll keep you posted on new stories.",
    });
    setEmailValue("");
  };

  if (postQ.isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (postQ.isError || !post) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="font-display text-3xl font-bold mb-4">Post not found</h1>
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const readMins = readMinutes(post.content);
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(dateLocale(language), {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImageUrl || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: "Magadh Explora" },
    publisher: {
      "@type": "Organization",
      name: "Magadh Explora",
      logo: {
        "@type": "ImageObject",
        url:
          typeof window !== "undefined"
            ? new URL("/Magadh_Explora_Logo.png", window.location.origin).toString()
            : "/Magadh_Explora_Logo.png",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.excerpt || `Read "${post.title}" on the Magadh Explora travel blog.`}
        image={post.coverImageUrl}
        type="article"
        author={post.author}
        publishedTime={post.publishedAt}
        jsonLd={articleLd}
      />

      {/* Full-width hero with overlay */}
      <section className="relative pt-16">
        <div className="relative h-[55vh] min-h-[380px] max-h-[600px] overflow-hidden">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-hero" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/10" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl"
              >
                {(post.categories ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories!.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold backdrop-blur-sm"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 drop-shadow-lg">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-primary-foreground/90 text-lg max-w-2xl mb-5 drop-shadow">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/80">
                  {formattedDate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/20 backdrop-blur-sm">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </span>
                  )}
                  {post.author && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/20 backdrop-blur-sm">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/20 backdrop-blur-sm">
                    <Clock className="w-4 h-4" />
                    {readMins} min read
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column: article + sticky sidebar */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main article */}
            <article className="lg:col-span-2 min-w-0">
              <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to blog
                </Link>
              </Button>

              {post.content ? (
                <div
                  className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-img:rounded-xl prose-img:shadow-medium"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">No content available.</p>
              )}

              {/* Article footer / share */}
              <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                  Published in <Link to="/blog" className="text-primary hover:underline">Magadh Explora Blog</Link>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    All posts
                  </Link>
                </Button>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="bg-card rounded-2xl p-5 shadow-soft">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search the blog…"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </form>
                </div>

                {/* About */}
                <div className="bg-card rounded-2xl p-5 shadow-soft">
                  <h3 className="font-display font-bold text-foreground mb-3">
                    About Magadh Explora
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-soft p-1 flex-shrink-0 overflow-hidden">
                      <img
                        src={MagadhExploraLogo}
                        alt="Magadh Explora"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We bring you closer to the rich heritage, culture and hidden treasures of Magadh.
                    </p>
                  </div>
                  <Link
                    to="/history-of-magadh"
                    className="text-sm text-primary font-medium inline-flex items-center mt-3 hover:underline"
                  >
                    Know more about us
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>

                {/* Categories */}
                {themes.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 shadow-soft">
                    <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      Categories
                    </h3>
                    <ul className="space-y-1">
                      {themes.map((c) => (
                        <li key={c.id}>
                          <Link
                            to={`/blog?category=${encodeURIComponent(c.slug)}`}
                            className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <span className="capitalize">{c.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Popular posts */}
                {popularPosts.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 shadow-soft">
                    <h3 className="font-display font-bold text-foreground mb-4">
                      Popular Posts
                    </h3>
                    <ul className="space-y-3">
                      {popularPosts.map((p) => (
                        <li key={p.id}>
                          <Link to={`/blog/${p.slug}`} className="flex gap-3 group">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              {p.coverImageUrl ? (
                                <img
                                  src={p.coverImageUrl}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {p.title}
                              </p>
                              {p.publishedAt && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(p.publishedAt).toLocaleDateString(dateLocale(language), {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Plan-your-trip CTA */}
                <div className="rounded-2xl p-6 text-primary-foreground bg-gradient-spiritual relative overflow-hidden">
                  <div className="absolute inset-0 bg-foreground/10" />
                  <div className="relative">
                    <Compass className="w-7 h-7 mb-3" />
                    <h3 className="font-display font-bold text-lg mb-2">
                      Plan Your Magadh Experience
                    </h3>
                    <p className="text-sm text-primary-foreground/90 mb-4">
                      Explore our specially curated tours and experiences across Bihar.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className={cn(
                        "bg-background/10 border-primary-foreground/30 text-primary-foreground",
                        "hover:bg-background/20 hover:text-primary-foreground"
                      )}
                    >
                      <Link to="/customize">
                        Explore Tours
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-card rounded-2xl p-5 shadow-soft">
                  <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Subscribe to Our Newsletter
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get travel inspiration and exclusive updates straight to your inbox.
                  </p>
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Subscribe
                    </Button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
