import { motion } from "framer-motion";
import { Check, Star, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const tierIcons = {
  essential: Star,
  deluxe: Crown,
  premium: Gem,
};

const tierGradients = {
  essential: "from-blue-500 to-cyan-500",
  deluxe: "from-primary to-burgundy",
  premium: "from-gold to-amber-500",
};

const tierPrices = {
  essential: { from: 15000, label: "₹15,000" },
  deluxe: { from: 35000, label: "₹35,000" },
  premium: { from: 65000, label: "₹65,000" },
};

interface PackageTiersSectionProps {
  onGetQuote: () => void;
}

export function PackageTiersSection({ onGetQuote }: PackageTiersSectionProps) {
  const { t } = useLanguage();

  const tiers = ['essential', 'deluxe', 'premium'] as const;

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            {t.packages.badge}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From budget-friendly explorations to luxury journeys, we have the perfect package for every traveler
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tierIcons[tier];
            const isPopular = tier === 'deluxe';
            
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={cn(
                  "relative group",
                  isPopular && "md:-mt-4 md:mb-4"
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-burgundy text-primary-foreground text-sm font-semibold shadow-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={cn(
                  "h-full rounded-2xl p-8 transition-all duration-500",
                  "bg-card border-2",
                  isPopular 
                    ? "border-primary shadow-large" 
                    : "border-border shadow-soft hover:shadow-medium hover:border-primary/50"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                    "bg-gradient-to-br",
                    tierGradients[tier]
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                    {t.tiers[tier].name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {t.tiers[tier].tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground">{t.packages.startingFrom}</p>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-3xl font-bold",
                        tier === 'premium' && "text-gold",
                        tier === 'deluxe' && "text-primary",
                        tier === 'essential' && "text-foreground"
                      )}>
                        {tierPrices[tier].label}
                      </span>
                      <span className="text-muted-foreground text-sm">/{t.packages.perPerson}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {t.tiers[tier].features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center",
                          "bg-gradient-to-br",
                          tierGradients[tier]
                        )}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={onGetQuote}
                    className={cn(
                      "w-full",
                      tier === 'premium' && "bg-gradient-gold hover:opacity-90",
                      tier === 'deluxe' && "bg-gradient-to-r from-primary to-burgundy hover:opacity-90",
                    )}
                    variant={tier === 'essential' ? 'outline' : 'default'}
                    size="lg"
                  >
                    {t.nav.getQuote}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
