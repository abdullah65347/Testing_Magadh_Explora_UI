import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-shanti-stupa.png";

interface HeroSectionProps {
  onGetQuote?: () => void;
}

const TRUST_ITEMS = [
  {
    icon: Users,
    title: "Happy Travelers",
    subtitle: "4K+ 250+ Reviews",
  },
  {
    icon: Award,
    title: "Expert Guides",
    subtitle: "Local & Friendly",
  },
  {
    icon: Shield,
    title: "Best Price Guarantee",
    subtitle: "No Hidden Charges",
  },
];

export function HeroSection({ onGetQuote: _onGetQuote }: HeroSectionProps) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Vishwa Shanti Stupa at golden hour, Rajgir"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/25 via-foreground/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-28 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border text-foreground text-sm mb-6 shadow-soft">
              <Sparkles className="w-4 h-4 text-primary" />
              Discover the Timeless Heritage
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.05] mb-6"
          >
            Explore the Legacy
            <br />
            of <span className="text-primary">Magadh</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/85 mb-8 max-w-2xl leading-relaxed"
          >
            Walk through history, spirituality and culture in the land of Buddha,
            Mahavira and ancient empires.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/destinations">
                Explore Destinations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="bg-transparent border-foreground text-foreground hover:bg-foreground hover:text-background"
              asChild
            >
              <Link to="/packages">View Your Packages</Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex flex-wrap gap-x-8 gap-y-4 bg-background/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-medium"
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
