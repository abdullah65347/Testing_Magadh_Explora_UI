import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { Package } from "@/api/services/packageService";
import heroFallback from "@/assets/hero-nalanda.jpg";

interface Props {
    pkg: Package;
    /** Optional override for the fallback hero image when no image is set on the package */
    fallbackImage?: string;
}

export function PackageCardLarge({ pkg, fallbackImage = heroFallback }: Props) {
    const { formatPrice } = useCurrency();
    const image =
        pkg.heroImageUrl ||
        pkg.images?.find((i) => i.primary)?.url ||
        pkg.images?.[0]?.url ||
        fallbackImage;

    const tier = pkg.categories?.find((c) => c.kind === "TIER")?.name;
    const theme = pkg.categories?.find((c) => c.kind === "THEME")?.name;
    const tag = tier || theme || "Tour";
    const tagType = (tier || theme || "").toLowerCase();

    const groupSize =
        pkg.groupSizeMin && pkg.groupSizeMax
            ? `${pkg.groupSizeMin}-${pkg.groupSizeMax}`
            : pkg.groupSizeMin
                ? `${pkg.groupSizeMin}+`
                : null;

    const highlights = (pkg.destinations ?? []).slice(0, 4).map((d) => d.name);

    return (
        <Link to={`/packages/${pkg.slug}`} className="block h-full group">
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 h-full flex flex-col">
                <div className="relative h-56 overflow-hidden">
                    <img
                        src={image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                    <span
                        className={cn(
                            "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold",
                            tagType.includes("premium") && "bg-gradient-gold text-primary-foreground",
                            tagType.includes("spiritual") && "bg-gradient-spiritual text-primary-foreground",
                            tagType.includes("adventure") && "bg-secondary text-secondary-foreground",
                            tagType.includes("culture") && "bg-gradient-premium text-primary-foreground",
                            !tagType.match(/premium|spiritual|adventure|culture/) &&
                                "bg-primary text-primary-foreground"
                        )}
                    >
                        {tag}
                    </span>

                    {pkg.rating != null && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
                            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                            <span className="text-xs font-semibold text-foreground">
                                {Number(pkg.rating).toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {pkg.title}
                    </h3>
                    {(pkg.summary || pkg.description) && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {pkg.summary || pkg.description}
                        </p>
                    )}

                    {highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {highlights.map((place) => (
                                <span
                                    key={place}
                                    className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                                >
                                    {place}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {pkg.durationDays && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {pkg.durationDays} Days
                            </span>
                        )}
                        {groupSize && (
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {groupSize} people
                            </span>
                        )}
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-border">
                        <div>
                            <p className="text-xs text-muted-foreground">Starting from</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(Number(pkg.priceInr))}
                                </span>
                                {pkg.originalPriceInr &&
                                    Number(pkg.originalPriceInr) > Number(pkg.priceInr) && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {formatPrice(Number(pkg.originalPriceInr))}
                                        </span>
                                    )}
                            </div>
                        </div>
                        <Button size="sm" className="group/btn" asChild>
                            <span>
                                View
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default PackageCardLarge;
