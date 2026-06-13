import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowRight, Camera, Clock, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { destinationService, type Destination } from "@/api/services/destinationService";
import { packageService, type Package } from "@/api/services/packageService";
import heroFallback from "@/assets/hero-nalanda.jpg";

export default function DestinationDetailPage() {
  const { slug = "" } = useParams();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();

  const destQ = useQuery<Destination>({
    queryKey: ["destination", slug, language],
    queryFn: () => destinationService.get(slug, language),
    enabled: !!slug,
  });
  const packagesQ = useQuery({
    queryKey: ["packages", "public", language],
    queryFn: () => packageService.list({ lang: language }),
  });

  const dest = destQ.data;
  const heroSrc = dest?.heroImageUrl || heroFallback;

  const relatedPackages = useMemo<Package[]>(() => {
    if (!dest || !packagesQ.data) return [];
    return packagesQ.data
      .filter((p) => p.destinations.some((d) => d.id === dest.id))
      .slice(0, 6);
  }, [dest, packagesQ.data]);

  if (destQ.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading destination…
      </div>
    );
  }
  if (destQ.isError || !dest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-3xl font-bold">Destination not found</h1>
        <Link to="/destinations">
          <Button variant="outline">Browse all destinations</Button>
        </Link>
      </div>
    );
  }

  const placeLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: dest.name,
    description: dest.description,
    image: heroSrc,
    address: {
      "@type": "PostalAddress",
      addressRegion: dest.region || "Bihar",
      addressCountry: "IN",
    },
    ...(dest.latitude && dest.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: dest.latitude,
            longitude: dest.longitude,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Destinations", item: "/destinations" },
      { "@type": "ListItem", position: 3, name: dest.name },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${dest.name} — Travel Guide`}
        description={
          dest.description ||
          `Explore ${dest.name} in ${dest.region || "Bihar"} — history, attractions, and curated tour packages.`
        }
        image={heroSrc}
        keywords={`${dest.name}, ${dest.region || "Bihar"}, travel guide, tourism, pilgrimage`}
        jsonLd={[placeLd, breadcrumbLd]}
      />

      <section className="relative h-[55vh] min-h-[400px] pt-16">
        <img
          src={heroSrc}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <nav className="text-sm text-primary-foreground/80 mb-2">
                <Link to="/" className="hover:text-primary-foreground">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link to="/destinations" className="hover:text-primary-foreground">
                  Destinations
                </Link>
              </nav>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-2">
                {dest.name}
              </h1>
              {dest.region && (
                <p className="text-xl text-primary-foreground/90 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {dest.region}, Bihar
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {dest.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" />
                    About {dest.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                    {dest.description}
                  </p>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-medium">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3 text-sm">
                  {dest.region && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{dest.region}, Bihar</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-foreground">
                      Best time: October – March
                    </span>
                  </div>
                  {dest.latitude && dest.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${dest.latitude},${dest.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-primary hover:underline"
                    >
                      <Camera className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>

                <Link to="/customize" className="block mt-5">
                  <Button variant="hero" className="w-full">
                    Plan a Trip Here
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedPackages.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Tours that visit {dest.name}
            </h2>
            <p className="text-muted-foreground mb-6">
              {relatedPackages.length} curated package
              {relatedPackages.length === 1 ? "" : "s"}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPackages.map((p) => {
                const hero =
                  p.heroImageUrl ||
                  p.images.find((i) => i.primary)?.url ||
                  p.images[0]?.url ||
                  heroFallback;
                const tier = p.categories.find((c) => c.kind === "TIER")?.name;
                return (
                  <Link
                    key={p.id}
                    to={`/packages/${p.slug}`}
                    className="block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hero}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {tier && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/95 text-xs font-semibold">
                          {tier}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-foreground line-clamp-1 mb-1">
                        {p.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {p.summary}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(Number(p.priceInr))}
                        </span>
                        {p.durationDays && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {p.durationDays}d
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
