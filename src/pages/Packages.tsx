import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  X,
  SlidersHorizontal
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import heroImg from "@/assets/hero-nalanda.jpg";
import { explorePackCover } from "@/assets/assets";

import { packageService, type Package } from "@/api/services/packageService";
import { categoryService, type Category } from "@/api/services/categoryService";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { SEO } from "@/components/SEO";

const ALL = "All";

const durations = [ALL, "1-3 Days", "4-7 Days", "8+ Days"];

function pickHeroImage(p: Package): string {
  if (p.heroImageUrl) return p.heroImageUrl;
  const primary = p.images.find((i) => i.primary) ?? p.images[0];
  return primary?.url ?? heroImg;
}

export default function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(ALL);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedDuration, setSelectedDuration] = useState(ALL);
  const [selectedTraveler, setSelectedTraveler] = useState(ALL);
  const [showFilters, setShowFilters] = useState(false);
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();

  const packagesQ = useQuery({
    queryKey: ["packages", "public", language],
    queryFn: () => packageService.list({ lang: language }),
  });
  const categoriesQ = useQuery({
    queryKey: ["categories", "public"],
    queryFn: () => categoryService.list(),
  });

  const themes: Category[] = useMemo(
    () => (categoriesQ.data ?? []).filter((c) => c.kind === "THEME" && c.active),
    [categoriesQ.data]
  );
  const tiers: Category[] = useMemo(
    () => (categoriesQ.data ?? []).filter((c) => c.kind === "TIER" && c.active),
    [categoriesQ.data]
  );

  const typeOptions = useMemo(() => [ALL, ...themes.map((t) => t.name)], [themes]);
  const categoryOptions = useMemo(() => [ALL, ...tiers.map((t) => t.name)], [tiers]);

  const travelerOptions = useMemo(() => {
    const set = new Set<string>();
    (packagesQ.data ?? []).forEach((p) => {
      (p.travelerTypes ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    });
    return [ALL, ...Array.from(set).sort()];
  }, [packagesQ.data]);

  const filteredPackages = useMemo(() => {
    const all = packagesQ.data ?? [];
    return all.filter((pkg) => {
      const haystack = `${pkg.title} ${pkg.summary ?? ""} ${pkg.description ?? ""}`.toLowerCase();
      const matchesSearch = !searchQuery || haystack.includes(searchQuery.toLowerCase());

      const themeNames = pkg.categories.filter((c) => c.kind === "THEME").map((c) => c.name);
      const tierNames  = pkg.categories.filter((c) => c.kind === "TIER").map((c) => c.name);

      const matchesType = selectedType === ALL || themeNames.includes(selectedType);
      const matchesCategory = selectedCategory === ALL || tierNames.includes(selectedCategory);

      let matchesDuration = true;
      if (selectedDuration !== ALL && pkg.durationDays != null) {
        const d = pkg.durationDays;
        if (selectedDuration === "1-3 Days") matchesDuration = d <= 3;
        else if (selectedDuration === "4-7 Days") matchesDuration = d >= 4 && d <= 7;
        else if (selectedDuration === "8+ Days") matchesDuration = d >= 8;
      }

      const travelerList = (pkg.travelerTypes ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const matchesTraveler =
        selectedTraveler === ALL || travelerList.includes(selectedTraveler);

      return matchesSearch && matchesType && matchesCategory && matchesDuration && matchesTraveler;
    });
  }, [packagesQ.data, searchQuery, selectedType, selectedCategory, selectedDuration, selectedTraveler]);

  const clearFilters = () => {
    setSelectedType(ALL);
    setSelectedCategory(ALL);
    setSelectedDuration(ALL);
    setSelectedTraveler(ALL);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedType !== ALL ||
    selectedCategory !== ALL ||
    selectedDuration !== ALL ||
    selectedTraveler !== ALL ||
    searchQuery !== "";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tour Packages — Buddhist Circuit, Jain Pilgrimage & Bihar Heritage Tours"
        description="Curated multi-day tour packages across Bihar: Buddhist Circuit (Bodh Gaya, Nalanda, Rajgir), Jain pilgrimage to Pawapuri, and Magadh heritage tours. Essential, Deluxe, and Premium tiers."
        keywords="Bihar tour packages, Buddhist circuit tour, Bodh Gaya package, Nalanda Rajgir tour, Jain pilgrimage package, Magadh tour"
      />
      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${explorePackCover})` }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Our Packages
            </h1>
            <p className="text-white text-lg">
              Find the perfect travel experience tailored to your interests, duration, and budget
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-md z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {typeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-primary text-primary-foreground")}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                More Filters
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {[selectedType, selectedCategory, selectedDuration, selectedTraveler].filter((f) => f !== ALL).length}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Type (mobile only — desktop has chips above) */}
                <div className="lg:hidden">
                  <p className="text-sm font-medium text-foreground mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          selectedType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          selectedDuration === dur
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {travelerOptions.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Traveler Type</p>
                    <div className="flex flex-wrap gap-2">
                      {travelerOptions.map((tt) => (
                        <button
                          key={tt}
                          onClick={() => setSelectedTraveler(tt)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all capitalize",
                            selectedTraveler === tt
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {tt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredPackages.length}</span> packages
            </p>
            <Link to="/customize">
              <Button variant="outline">Build Custom Package</Button>
            </Link>
          </div>

          {packagesQ.isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading packages…</div>
          ) : packagesQ.isError ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-2">Couldn't reach the server.</p>
              <p className="text-sm text-muted-foreground">
                Make sure the Spring Boot backend is running on http://localhost:8080
              </p>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 xl2:grid-cols-3 gap-8">
              {filteredPackages.map((pkg, index) => {
                const themeName = pkg.categories.find((c) => c.kind === "THEME")?.name;
                const tierName  = pkg.categories.find((c) => c.kind === "TIER")?.name;
                const groupSize =
                  pkg.groupSizeMin && pkg.groupSizeMax
                    ? `${pkg.groupSizeMin}-${pkg.groupSizeMax}`
                    : pkg.groupSizeMin
                      ? `${pkg.groupSizeMin}+`
                      : "—";

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={pickHeroImage(pkg)}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                        <div className="absolute top-4 left-4 flex gap-2">
                          {tierName && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold",
                              tierName === "Premium" ? "bg-gradient-gold text-primary-foreground" :
                              tierName === "Spiritual" ? "bg-gradient-spiritual text-primary-foreground" :
                              "bg-secondary text-secondary-foreground"
                            )}>
                              {tierName}
                            </span>
                          )}
                          {themeName && (
                            <span className="px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium">
                              {themeName}
                            </span>
                          )}
                        </div>

                        {pkg.rating != null && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
                            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                            <span className="text-xs font-semibold text-foreground">{Number(pkg.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {pkg.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {pkg.summary || pkg.description}
                        </p>

                        {pkg.destinations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {pkg.destinations.slice(0, 3).map((place) => (
                              <span
                                key={place.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                              >
                                <MapPin className="w-3 h-3" />
                                {place.name}
                              </span>
                            ))}
                            {pkg.destinations.length > 3 && (
                              <span className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                                +{pkg.destinations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {pkg.durationDays && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {pkg.durationDays} Days
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {groupSize}
                          </span>
                          {pkg.reviewsCount > 0 && (
                            <span className="text-muted-foreground/60">{pkg.reviewsCount} reviews</span>
                          )}
                        </div>

                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Starting from</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(Number(pkg.priceInr))}
                              </span>
                              {pkg.originalPriceInr && Number(pkg.originalPriceInr) > Number(pkg.priceInr) && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(Number(pkg.originalPriceInr))}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={`/packages/${pkg.slug}`}>
                            <Button size="sm" className="group/btn">
                              View Details
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No packages found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
