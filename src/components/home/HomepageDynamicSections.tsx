import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, MapPin, BookOpen, Sparkles, Mountain } from "lucide-react";
import { PackageCardLarge } from "@/components/PackageCardLarge";
import { Button } from "@/components/ui/button";
import { homepageService, type HomepageSection, type HomepageEntityType } from "@/api/services/homepageService";
import { packageService, type Package } from "@/api/services/packageService";
import { destinationService, type Destination } from "@/api/services/destinationService";
import { blogService, type Blog } from "@/api/services/blogService";
import { useCurrency } from "@/context/CurrencyContext";
import heroImg from "@/assets/hero-nalanda.jpg";

interface Props {
  /**
   * Kept for backward compatibility but ignored — the component now always falls back
   * to live featured packages / destinations from the API when no admin layout exists.
   */
  fallback?: ReactNode;
}

type ResolvedItem =
  | { kind: "PACKAGE"; data: Package }
  | { kind: "DESTINATION"; data: Destination }
  | { kind: "BLOG"; data: Blog };

const FEATURED_LIMIT = 6;
const DESTINATIONS_LIMIT = 5;
const BLOGS_LIMIT = 3;

export function HomepageDynamicSections(_: Props) {
  const layoutQ = useQuery({
    queryKey: ["homepage", "public"],
    queryFn: homepageService.publicLayout,
  });
  const packagesQ = useQuery({
    queryKey: ["packages", "public"],
    queryFn: () => packageService.list(),
  });
  const destinationsQ = useQuery({
    queryKey: ["destinations", "public"],
    queryFn: () => destinationService.list(),
  });
  const blogsQ = useQuery({
    queryKey: ["blogs", "public"],
    queryFn: () => blogService.list(),
  });

  const entityMaps = useMemo(() => ({
    PACKAGE: new Map((packagesQ.data ?? []).map((p) => [p.id, p])),
    DESTINATION: new Map((destinationsQ.data ?? []).map((d) => [d.id, d])),
    BLOG: new Map((blogsQ.data ?? []).map((b) => [b.id, b])),
  }), [packagesQ.data, destinationsQ.data, blogsQ.data]);

  if (layoutQ.isLoading) return null;

  // -------------------------------------------------------------------------
  // Resolve admin sections up-front so we can tell if they'd render to nothing
  // (admin created a section but didn't add items, or the items reference
  // missing entities). In that case we drop back to the auto layout instead of
  // showing a blank homepage.
  // -------------------------------------------------------------------------
  const resolvedAdminSections = (layoutQ.data ?? []).map((section) => {
    const items: ResolvedItem[] = section.items
      .slice(0, section.maxItems || section.items.length)
      .map((it) => {
        const data = entityMaps[it.entityType as HomepageEntityType]?.get(it.entityId);
        if (!data) return null;
        return { kind: it.entityType as HomepageEntityType, data } as ResolvedItem;
      })
      .filter(Boolean) as ResolvedItem[];
    return { section, items };
  });
  const adminHasRenderableContent = resolvedAdminSections.some((r) => r.items.length > 0);

  if (!adminHasRenderableContent) {
    const featured = (packagesQ.data ?? []).filter((p) => p.featured);
    const packagesToShow = (featured.length > 0 ? featured : (packagesQ.data ?? []))
      .slice(0, FEATURED_LIMIT);
    const destinationsToShow = (destinationsQ.data ?? []).slice(0, DESTINATIONS_LIMIT);
    const blogsToShow = (blogsQ.data ?? []).slice(0, BLOGS_LIMIT);

    return (
      <>
        {packagesToShow.length > 0 && (
          <PackagesAutoSection
            packages={packagesToShow}
            isFeatured={featured.length > 0}
          />
        )}

        {destinationsToShow.length > 0 && (
          <DestinationsAutoSection destinations={destinationsToShow} />
        )}

        {blogsToShow.length > 0 && (
          <AutoSection
            title="From the Blog"
            subtitle="Travel stories, tips, and pilgrimage guides"
            viewAllHref="/blog"
            items={blogsToShow.map((b) => ({ kind: "BLOG", data: b } as ResolvedItem))}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Admin-configured layout — renders sections in order.
  // -------------------------------------------------------------------------
  return (
    <>
      {resolvedAdminSections.map(({ section, items }) => {
        if (items.length === 0) return null;
        return <DynamicSection key={section.id} section={section} items={items} />;
      })}
    </>
  );
}

function AutoSection({
  title,
  subtitle,
  viewAllHref,
  items,
  tinted,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  items: ResolvedItem[];
  tinted?: boolean;
}) {
  return (
    <section className={`py-16 ${tinted ? "bg-muted/30" : "bg-background"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Button variant="outline" asChild>
              <Link to={viewAllHref}>
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, idx) => (
            <ItemCard key={`${it.kind}-${(it.data as { id: number }).id}`} item={it} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicSection({ section, items }: { section: HomepageSection; items: ResolvedItem[] }) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {section.title}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, idx) => (
            <ItemCard key={`${it.kind}-${(it.data as { id: number }).id}`} item={it} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ItemCard({ item, index }: { item: ResolvedItem; index: number }) {
  const common = "block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 h-full flex flex-col group";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {item.kind === "PACKAGE" && <PackageCard pkg={item.data} className={common} />}
      {item.kind === "DESTINATION" && <DestinationCard dest={item.data} className={common} />}
      {item.kind === "BLOG" && <BlogCard post={item.data} className={common} />}
    </motion.div>
  );
}

function PackagesAutoSection({
  packages,
  isFeatured,
}: {
  packages: Package[];
  isFeatured: boolean;
}) {
  return (
    <section className="py-24 bg-gradient-warm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Curated Experiences
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {isFeatured ? "Featured Travel Packages" : "Popular Travel Packages"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our carefully crafted travel experiences designed to immerse
            you in Bihar's rich cultural heritage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl2:grid-cols-4 gap-6">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group"
            >
              <PackageCardLarge pkg={pkg} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/packages">
              View All Packages
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function DestinationsAutoSection({ destinations }: { destinations: Destination[] }) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
              <Mountain className="w-4 h-4" />
              Top Destinations
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Explore Popular <span className="text-primary">Destinations</span>
            </h2>
          </div>
          <Link
            to="/destinations"
            className="text-primary font-medium inline-flex items-center hover:gap-3 gap-2 transition-all group"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {destinations.map((d, idx) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <DestinationCardCompact dest={d} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCardCompact({ dest }: { dest: Destination }) {
  return (
    <Link
      to={`/destinations/${dest.slug}`}
      className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500"
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {dest.heroImageUrl ? (
          <img
            src={dest.heroImageUrl}
            alt={dest.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="px-4 pt-7 pb-5 text-center relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-medium flex items-center justify-center border-4 border-card">
          <Mountain className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
          {dest.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {dest.region || "Bihar"}, India
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

function PackageCard({ pkg, className }: { pkg: Package; className: string }) {
  const { formatPrice } = useCurrency();
  const image = pkg.heroImageUrl || pkg.images?.find((i) => i.primary)?.url || pkg.images?.[0]?.url || heroImg;
  return (
    <Link to={`/packages/${pkg.slug}`} className={className}>
      <div className="relative h-48 overflow-hidden bg-muted">
        <img src={image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Package</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{pkg.title}</h3>
        {pkg.summary && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{pkg.summary}</p>}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
          {pkg.durationDays && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.durationDays} Days</span>
          )}
          <span className="ml-auto font-semibold text-primary">{formatPrice(pkg.priceInr)}</span>
        </div>
      </div>
    </Link>
  );
}

function DestinationCard({ dest, className }: { dest: Destination; className: string }) {
  return (
    <Link to={`/destinations/${dest.slug}`} className={className}>
      <div className="relative h-48 overflow-hidden bg-muted">
        {dest.heroImageUrl ? (
          <img src={dest.heroImageUrl} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><MapPin className="w-8 h-8" /></div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">Destination</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{dest.name}</h3>
        {dest.region && <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{dest.region}</p>}
        {dest.description && <p className="text-muted-foreground text-sm line-clamp-3 flex-1">{dest.description}</p>}
        <Button variant="ghost" size="sm" className="mt-3 self-start group/btn -ml-3" asChild>
          <span>Explore <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></span>
        </Button>
      </div>
    </Link>
  );
}

function BlogCard({ post, className }: { post: Blog; className: string }) {
  return (
    <Link to={`/blog/${post.slug}`} className={className}>
      <div className="relative h-48 overflow-hidden bg-muted">
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><BookOpen className="w-8 h-8" /></div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">Story</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
        {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-3 flex-1">{post.excerpt}</p>}
        {post.author && <p className="text-xs text-muted-foreground mt-3">By {post.author}</p>}
      </div>
    </Link>
  );
}

export default HomepageDynamicSections;
