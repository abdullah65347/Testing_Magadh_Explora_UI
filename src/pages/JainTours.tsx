import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { PackageCardLarge } from "@/components/PackageCardLarge";
import { packageService, type Package } from "@/api/services/packageService";
import {
  pawapuriImg,
  rajgir1Img,
  ashokanPillarVaishaliImg,
  bodhGayaSharedImg,
} from "@/assets/assets";

const SITES = [
  {
    name: "Pawapuri",
    image: pawapuriImg,
    significance: "The Jal Mandir — a white marble temple in the middle of a lotus pond — marks the exact spot where Lord Mahavira attained Nirvana in 527 BCE.",
    highlights: ["Jal Mandir (water temple)", "Samosharan Mandir", "Naulakha Mandir", "Annual Diwali pilgrimage"],
  },
  {
    name: "Vaishali",
    image: ashokanPillarVaishaliImg,
    significance: "Birthplace of Lord Mahavira, the 24th Tirthankara. The republican capital of the Licchavi clan and one of the world's first democracies.",
    highlights: ["Mahavira's birth site (Kundagrama)", "Ashokan Pillar", "Coronation Tank", "Relic Stupa"],
  },
  {
    name: "Rajgir",
    image: rajgir1Img,
    significance: "Mahavira spent 14 monsoon retreats here. The Sonbhandar Caves and 26 Jain temples on the surrounding hills make it a major Digambara and Shvetambara pilgrimage.",
    highlights: ["Vipulachal hill temples", "Sonbhandar Caves", "Veerayatan museum", "Rope-way to Vishwa Shanti Stupa"],
  },
  {
    name: "Kundalpur (Nalanda)",
    image: bodhGayaSharedImg,
    significance: "Believed by Digambara Jains to be the birthplace of Mahavira. A serene complex of marble temples just outside Nalanda ruins.",
    highlights: ["Bade Baba temple", "Digambara Jain heritage", "Annual Mahamastakabhisheka"],
  },
];

const FAQ = [
  {
    q: "Which Jain teerths are covered in your tours?",
    a: "Our standard Jain Bihar circuit covers Pawapuri, Vaishali, Rajgir and Kundalpur. We can extend with Champapuri (Bhagalpur) — where Vasupujya Bhagwan attained Nirvana — and Sammed Shikharji (Jharkhand).",
  },
  {
    q: "What's the best time for a Jain pilgrimage?",
    a: "October to February is ideal. Mahavir Jayanti (March/April) and Diwali (Mahavira's Nirvana day, October/November) are spiritually significant but crowded.",
  },
  {
    q: "Will you arrange Jain-only meals?",
    a: "Yes. All Jain Circuit packages include strict Jain meals — no root vegetables, prepared fresh, served before sunset where required.",
  },
  {
    q: "Are Digambara and Shvetambara temples both visited?",
    a: "Yes. Rajgir's hill temples have both sects, Pawapuri has separate Shvetambara and Digambara shrines, and Kundalpur is primarily Digambara. Your guide will explain the rituals at each.",
  },
];

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Jain Pilgrimage Sites in Bihar",
  itemListElement: SITES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.name,
    description: s.significance,
  })),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function matchesJain(pkg: Package): boolean {
  const themes = pkg.categories
    .filter((c) => c.kind === "THEME")
    .map((c) => c.name.toLowerCase());
  const dests = pkg.destinations.map((d) => d.slug);
  if (themes.some((n) => n.includes("jain"))) return true;
  return dests.some((s) => ["pawapuri", "vaishali", "rajgir", "kundalpur"].includes(s));
}

export default function JainToursPage() {
  const packagesQ = useQuery({
    queryKey: ["packages", "public"],
    queryFn: () => packageService.list(),
  });

  const jainPackages = (packagesQ.data ?? []).filter(matchesJain).slice(0, 6);

  return (
    <div className="min-h-screen bg-background theme-page theme-page-jain">
      <SEO
        title="Jain Pilgrimage Tours — Pawapuri, Vaishali & Rajgir"
        description="Sacred Jain teerth tours covering Pawapuri (Mahavira's Nirvana site), Vaishali (his birthplace), Rajgir and Kundalpur. Strict Jain meals, expert guides, dedicated pilgrimage itineraries."
        keywords="Jain pilgrimage Bihar, Pawapuri Jal Mandir, Mahavira birthplace, Vaishali Jain teerth, Rajgir Jain temples, Kundalpur, Jain tour package"
        jsonLd={[itemListLd, faqLd]}
      />

      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pawapuriImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Walk the path of Lord Mahavira
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Jain Pilgrimage Tours
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              From the birthplace of Mahavira in Vaishali to his Nirvana site at
              Pawapuri — visit the most sacred Jain teerths of ancient Magadh.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/packages">
                <Button variant="hero" size="lg">
                  Browse Packages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/customize">
                <Button variant="outline" size="lg" className="bg-background/80 backdrop-blur">
                  Plan Custom Yatra
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            The Sacred Geography of Jain Bihar
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Bihar — ancient Magadh — was the cradle of Jainism. Lord Mahavira was born
            in Vaishali, attained Kevala Jnana near Rijubalika river, delivered
            countless sermons across Rajgir's hills, and finally attained Moksha at
            Pawapuri. Visiting these teerths is a once-in-a-lifetime journey for every
            Jain.
          </p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            The Four Great Teerths
          </h2>
          <div className="space-y-12">
            {SITES.map((site, i) => (
              <motion.div
                key={site.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="rounded-2xl overflow-hidden shadow-large">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Bihar, India
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {site.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {site.significance}
                  </p>
                  <ul className="space-y-2">
                    {site.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {jainPackages.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Recommended Jain Yatras
                </h2>
                <p className="text-muted-foreground">
                  Curated pilgrimage packages with Jain meals and dedicated guides
                </p>
              </div>
              <Link to="/packages" className="hidden md:inline-block">
                <Button variant="outline">
                  View all
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jainPackages.map((pkg) => (
                <PackageCardLarge key={pkg.id} pkg={pkg} fallbackImage={pawapuriImg} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group bg-card rounded-xl p-5 shadow-soft open:shadow-medium"
              >
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-spiritual rounded-3xl p-10 md:p-14 text-primary-foreground">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Plan your Jain Teerth Yatra
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Group, family or sangh — we handle Jain meals, schedules around darshan,
              and respectful guides who understand the rituals.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/customize">
                <Button variant="hero" size="lg">
                  Plan My Yatra
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20"
                >
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
