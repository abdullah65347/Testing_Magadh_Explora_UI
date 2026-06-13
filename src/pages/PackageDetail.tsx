import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  Sparkles,
  Calendar,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { packageService, type Package } from "@/api/services/packageService";
import { quoteService } from "@/api/services/quoteService";
import { reviewService } from "@/api/services/reviewService";
import { ReviewsSection } from "@/components/ReviewsSection";
import { BookNowModal } from "@/components/BookNowModal";
import { useFormAbandonment } from "@/hooks/useFormAbandonment";
import { track } from "@/lib/analytics";
import heroFallback from "@/assets/hero-nalanda.jpg";

function pickHero(p: Package): string {
  if (p.heroImageUrl) return p.heroImageUrl;
  const primary = p.images.find((i) => i.primary) ?? p.images[0];
  return primary?.url ?? heroFallback;
}

function bulletize(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((s) => s.replace(/^[-•*\d.\s]+/, "").trim())
    .filter(Boolean);
}

export default function PackageDetailPage() {
  const { slug = "" } = useParams();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { toast } = useToast();

  const packageQ = useQuery({
    queryKey: ["package", slug, language],
    queryFn: () => packageService.get(slug, language),
    enabled: !!slug,
  });
  const allPackagesQ = useQuery({
    queryKey: ["packages", "public", language],
    queryFn: () => packageService.list({ lang: language }),
  });
  const reviewsQ = useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => reviewService.listForPackage(slug),
    enabled: !!slug,
  });

  const pkg = packageQ.data;
  const heroSrc = pkg ? pickHero(pkg) : heroFallback;
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!pkg) return;
    void track({
      eventType: "package_view",
      properties: { packageId: pkg.id, slug: pkg.slug, title: pkg.title },
    });
  }, [pkg?.id]);

  const gallery = useMemo<string[]>(() => {
    if (!pkg) return [];
    const list: string[] = [];
    if (pkg.heroImageUrl) list.push(pkg.heroImageUrl);
    pkg.images.forEach((img) => {
      if (!list.includes(img.url)) list.push(img.url);
    });
    return list.length ? list : [heroSrc];
  }, [pkg, heroSrc]);

  const itineraryLines = useMemo(() => bulletize(pkg?.itinerary), [pkg]);
  const inclusionsLines = useMemo(() => bulletize(pkg?.inclusions), [pkg]);
  const exclusionsLines = useMemo(() => bulletize(pkg?.exclusions), [pkg]);

  const related = useMemo<Package[]>(() => {
    if (!pkg || !allPackagesQ.data) return [];
    const myThemes = new Set(
      pkg.categories.filter((c) => c.kind === "THEME").map((c) => c.id)
    );
    return allPackagesQ.data
      .filter((p) => p.id !== pkg.id)
      .filter((p) =>
        p.categories.some((c) => c.kind === "THEME" && myThemes.has(c.id))
      )
      .slice(0, 3);
  }, [pkg, allPackagesQ.data]);

  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    travelDate: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  useFormAbandonment({
    source: "package-detail-quote",
    formState: { ...contact, packageSlug: pkg?.slug },
    submitted: isSuccess,
    enabled: !!pkg,
  });

  const handleQuote = async () => {
    if (!pkg) return;
    if (!contact.name || !contact.email) {
      toast({
        title: "Missing fields",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await quoteService.submit({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        packageTier: pkg.categories.find((c) => c.kind === "TIER")?.name,
        destinations: pkg.destinations.map((d) => d.name),
        travelDates: contact.travelDate || null,
        requirements: `Interested in: ${pkg.title} (${pkg.slug})\n\n${contact.notes}`,
      });
      setIsSuccess(true);
      toast({
        title: "Quote request sent",
        description: "We'll reach out within 24 hours.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Could not send",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (packageQ.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading package…
      </div>
    );
  }
  if (packageQ.isError || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl font-bold">Package not found</h1>
        <Link to="/packages">
          <Button variant="outline">Browse all packages</Button>
        </Link>
      </div>
    );
  }

  const tier = pkg.categories.find((c) => c.kind === "TIER")?.name;
  const themes = pkg.categories.filter((c) => c.kind === "THEME").map((c) => c.name);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary || pkg.description,
    image: heroSrc,
    touristType: themes,
    itinerary: pkg.destinations.map((d, i) => ({
      "@type": "Place",
      position: i + 1,
      name: d.name,
      address: d.region,
    })),
    offers: {
      "@type": "Offer",
      price: Number(pkg.priceInr),
      priceCurrency: "INR",
      availability: pkg.published
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(pkg.rating && pkg.reviewsCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(pkg.rating),
            reviewCount: pkg.reviewsCount,
          },
        }
      : {}),
    ...(reviewsQ.data && reviewsQ.data.length > 0
      ? {
          review: reviewsQ.data.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.authorName },
            datePublished: r.createdAt,
            reviewBody: r.body,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.title ? { name: r.title } : {}),
          })),
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Packages", item: "/packages" },
      { "@type": "ListItem", position: 3, name: pkg.title },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={pkg.title}
        description={pkg.summary || pkg.description || `Multi-day tour package: ${pkg.title}`}
        image={heroSrc}
        keywords={[pkg.title, ...themes, ...pkg.destinations.map((d) => d.name)].join(", ")}
        jsonLd={[productLd, breadcrumbLd]}
      />

      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/packages" className="hover:text-primary">Packages</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{pkg.title}</span>
          </nav>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden h-[420px] mb-3">
                <img
                  src={gallery[activeImage] || heroSrc}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {tier && (
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        tier === "Premium"
                          ? "bg-gradient-gold text-primary-foreground"
                          : tier === "Spiritual"
                            ? "bg-gradient-spiritual text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {tier}
                    </span>
                  )}
                  {themes.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {gallery.slice(0, 5).map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "rounded-lg overflow-hidden h-20 border-2 transition-all",
                        activeImage === i ? "border-primary" : "border-transparent"
                      )}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 shadow-medium sticky top-28"
              >
                <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                  {pkg.title}
                </h1>
                {pkg.summary && (
                  <p className="text-muted-foreground mb-4">{pkg.summary}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-5">
                  {pkg.durationDays && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      {pkg.durationDays} Days
                    </span>
                  )}
                  {(pkg.groupSizeMin || pkg.groupSizeMax) && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      {pkg.groupSizeMin ?? 1}
                      {pkg.groupSizeMax ? `–${pkg.groupSizeMax}` : "+"} pax
                    </span>
                  )}
                  {pkg.rating != null && (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      {Number(pkg.rating).toFixed(1)}
                      <span className="text-muted-foreground/60">
                        ({pkg.reviewsCount})
                      </span>
                    </span>
                  )}
                  {pkg.destinations.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      {pkg.destinations.length} stops
                    </span>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-5">
                  <p className="text-xs text-muted-foreground">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(Number(pkg.priceInr))}
                    </span>
                    {pkg.originalPriceInr &&
                      Number(pkg.originalPriceInr) > Number(pkg.priceInr) && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(Number(pkg.originalPriceInr))}
                        </span>
                      )}
                    <span className="text-sm text-muted-foreground">/ person</span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => setBookOpen(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <a href="#enquire" className="block w-full mt-2">
                  <Button variant="outline" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Request a Quote
                  </Button>
                </a>
                <a
                  href={`/api/packages/${pkg.slug}/brochure.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-2"
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-90" />
                    Download PDF Brochure
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {pkg.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                    About this Tour
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {pkg.description}
                  </p>
                </div>
              )}

              {pkg.destinations.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Destinations Covered
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {pkg.destinations.map((d) => (
                      <Link
                        key={d.id}
                        to={`/destinations/${d.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {d.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {itineraryLines.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Day-by-Day Itinerary
                  </h2>
                  <ol className="space-y-3">
                    {itineraryLines.map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 p-4 rounded-xl bg-card shadow-soft"
                      >
                        <span className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-foreground leading-relaxed">{line}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(inclusionsLines.length > 0 || exclusionsLines.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {inclusionsLines.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Inclusions
                      </h3>
                      <ul className="space-y-2">
                        {inclusionsLines.map((line, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusionsLines.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Exclusions
                      </h3>
                      <ul className="space-y-2">
                        {exclusionsLines.map((line, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <ReviewsSection packageId={pkg.id} packageSlug={pkg.slug} />

              <div
                id="enquire"
                className="bg-card rounded-2xl p-6 shadow-medium scroll-mt-32"
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Request a Personalised Quote
                </h2>
                <p className="text-muted-foreground mb-5">
                  Tell us your preferred travel dates and we'll email a tailored
                  itinerary within 24 hours.
                </p>

                {isSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Quote request sent!</p>
                    <p className="text-sm text-muted-foreground">
                      Check your inbox shortly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name *"
                        value={contact.name}
                        onChange={(e) =>
                          setContact({ ...contact, name: e.target.value })
                        }
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email *"
                        value={contact.email}
                        onChange={(e) =>
                          setContact({ ...contact, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground -mt-2">
                      By providing your details, you consent to be contacted by Magadh Explora.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <PhoneInput
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(v) =>
                          setContact({ ...contact, phone: v })
                        }
                      />
                      <Input
                        type="date"
                        value={contact.travelDate}
                        onChange={(e) =>
                          setContact({ ...contact, travelDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <Textarea
                      placeholder="Group size, dietary needs, special requests…"
                      rows={3}
                      value={contact.notes}
                      onChange={(e) =>
                        setContact({ ...contact, notes: e.target.value })
                      }
                    />
                    <Button
                      onClick={handleQuote}
                      disabled={isSubmitting}
                      variant="hero"
                      size="lg"
                      className="w-full"
                    >
                      {isSubmitting ? "Sending…" : "Send Quote Request"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
              {pkg.travelerTypes && (
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Ideal For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.travelerTypes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-spiritual rounded-2xl p-6 text-primary-foreground">
                <Sparkles className="w-6 h-6 mb-3" />
                <h3 className="font-display font-bold mb-2">
                  Want something different?
                </h3>
                <p className="text-sm text-primary-foreground/90 mb-4">
                  Use our package builder to design a custom multi-stop itinerary.
                </p>
                <Link to="/customize">
                  <Button variant="outline" className="w-full bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20">
                    Build Custom Tour
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              You may also like
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/packages/${p.slug}`}
                  className="block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={pickHero(p)}
                      alt={p.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-foreground line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
                      {p.summary}
                    </p>
                    <p className="text-primary font-bold">
                      {formatPrice(Number(p.priceInr))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      <BookNowModal isOpen={bookOpen} onClose={() => setBookOpen(false)} pkg={pkg} />
    </div>
  );
}
