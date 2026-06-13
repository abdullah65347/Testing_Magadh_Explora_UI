import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, User, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { blogService, type Blog as BlogPost } from "@/api/services/blogService";
import { categoryService, type Category } from "@/api/services/categoryService";
import { blogCover } from "@/assets/assets";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

const ALL = "all";

const dateLocale = (lang: string) =>
  lang === "zh" ? "zh-CN" :
  lang === "ja" ? "ja-JP" :
  lang === "hi" ? "hi-IN" :
  lang === "th" ? "th-TH" :
  lang === "vi" ? "vi-VN" :
  lang === "si" ? "si-LK" :
  "en-US";

export default function Blog() {
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    params.get("category") ?? ALL
  );
  const [searchQuery, setSearchQuery] = useState<string>(params.get("q") ?? "");

  const postsQ = useQuery({
    queryKey: ["blogs", "public"],
    queryFn: blogService.list,
  });

  const categoriesQ = useQuery({
    queryKey: ["categories", "public"],
    queryFn: () => categoryService.list(),
  });

  const categories: Category[] = useMemo(
    () => (categoriesQ.data ?? []).filter((c) => c.active),
    [categoriesQ.data]
  );

  // Keep URL in sync so the BlogPost sidebar search → /blog?q= flow works
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (selectedCategorySlug && selectedCategorySlug !== ALL) {
      next.set("category", selectedCategorySlug);
    } else {
      next.delete("category");
    }
    if (searchQuery.trim()) {
      next.set("q", searchQuery.trim());
    } else {
      next.delete("q");
    }
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategorySlug, searchQuery]);

  const filteredPosts: BlogPost[] = useMemo(() => {
    const list = postsQ.data ?? [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((post) => {
      if (selectedCategorySlug !== ALL) {
        const ok = (post.categories ?? []).some(
          (c) => c.slug?.toLowerCase() === selectedCategorySlug
        );
        if (!ok) return false;
      }
      if (q) {
        const hay = `${post.title} ${post.excerpt ?? ""} ${post.author ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [postsQ.data, selectedCategorySlug, searchQuery]);

  const hasActiveFilter = selectedCategorySlug !== ALL || searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Travel Blog — Bihar Tourism, Buddhist Pilgrimage & Heritage Stories"
        description="Discover Bihar through stories: Buddhist circuit travel guides, Nalanda history, Rajgir hot springs, Jain pilgrimage to Pawapuri, and the heritage of the Magadh Empire."
        keywords="Bihar travel blog, Buddhist circuit guide, Bodh Gaya travel, Nalanda history, Magadh heritage stories"
      />
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-warm relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${blogCover})` }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.blog.title}
            </h1>
            <p className="text-white text-lg">
              {t.blog.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur-md z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts…"
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategorySlug(ALL)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  selectedCategorySlug === ALL
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    setSelectedCategorySlug(
                      selectedCategorySlug === c.slug ? ALL : c.slug
                    )
                  }
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedCategorySlug === c.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategorySlug(ALL);
                  setSearchQuery("");
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {postsQ.isLoading && (
            <div className="text-center py-16 text-muted-foreground">Loading…</div>
          )}
          {postsQ.isError && !postsQ.isLoading && (
            <div className="text-center py-16 text-destructive">
              Failed to load blog posts.
            </div>
          )}
          {!postsQ.isLoading && !postsQ.isError && (
            <p className="text-sm text-muted-foreground mb-6">
              Showing <span className="font-semibold text-foreground">{filteredPosts.length}</span>{" "}
              {filteredPosts.length === 1 ? "post" : "posts"}
              {selectedCategorySlug !== ALL && (
                <> in <span className="font-semibold text-foreground">
                  {categories.find((c) => c.slug === selectedCategorySlug)?.name ?? selectedCategorySlug}
                </span></>
              )}
              {searchQuery.trim() && (
                <> matching <span className="font-semibold text-foreground">"{searchQuery.trim()}"</span></>
              )}
            </p>
          )}
          {!postsQ.isLoading && !postsQ.isError && filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No posts match your filters.</p>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategorySlug(ALL);
                    setSearchQuery("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`} className="block h-full">
                  <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          {post.title}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      {(post.categories ?? []).length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                          {post.categories!.slice(0, 2).map((c) => (
                            <span
                              key={c.id}
                              className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt).toLocaleDateString(dateLocale(language), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        {post.author ? (
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                        ) : <span />}
                        <Button variant="ghost" size="sm" className="group/btn" asChild>
                          <span>
                            {t.blog.readMore}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
