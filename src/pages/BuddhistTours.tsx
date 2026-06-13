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
  bodhGayaSharedImg,
  nalandaUniversityImg,
  rajgirMainImg,
  kesariyaImg,
  ashokanPillarVaishaliImg,
  sunsetBodhgayaImg,
} from "@/assets/assets";

const SITES = [
  {
    name: "Bodh Gaya",
    image: bodhGayaSharedImg,
    significance: "The Mahabodhi Temple marks the very spot where Prince Siddhartha attained enlightenment under the Bodhi Tree and became the Buddha.",
    highlights: ["Mahabodhi Temple (UNESCO)", "Bodhi Tree", "80-ft Great Buddha Statue", "Monasteries from Thailand, Japan, Bhutan"],
  },
  {
    name: "Nalanda",
    image: nalandaUniversityImg,
    significance: "The ruins of the world's first residential university where 10,000 monks studied logic, medicine and Buddhist philosophy for 800 years.",
    highlights: ["Nalanda Ruins (UNESCO)", "Xuanzang Memorial", "Nalanda Museum", "Hiuen Tsang's records"],
  },
  {
    name: "Rajgir",
    image: rajgirMainImg,
    significance: "The first Buddhist council was held at Saptaparni Caves here. The Buddha delivered the Lotus Sutra on Gridhrakuta (Vulture's Peak).",
    highlights: ["Gridhrakuta Hill", "Vishwa Shanti Stupa", "Saptaparni Cave", "Hot springs"],
  },
  {
    name: "Vaishali",
    image: ashokanPillarVaishaliImg,
    significance: "Where the Buddha preached his last sermon and announced his impending Mahaparinirvana. Site of Ashoka's perfect lion pillar.",
    highlights: ["Ashokan Pillar", "Relic Stupa", "Coronation Tank", "World Peace Pagoda"],
  },
  {
    name: "Kesariya",
    image: kesariyaImg,
    significance: "Home to the world's tallest Buddhist stupa (104 ft), commemorating where the Buddha spent his last days before continuing to Kushinagar.",
    highlights: ["Kesariya Stupa (tallest)", "Maurya-era brickwork", "Six terraces of meditation cells"],
  },
];

const FAQ = [
  {
    q: "How many days do I need for the Buddhist Circuit?",
    a: "A meaningful circuit covering Bodh Gaya, Nalanda, Rajgir and Vaishali takes 5–7 days. Add Kesariya, Patna and Kushinagar (UP) for a complete 10-day tour.",
  },
  {
    q: "What is the best time to visit?",
    a: "October to March, when daytime temperatures are 18–28°C. The Kalachakra ceremony in Bodh Gaya (Dec–Jan) draws pilgrims worldwide.",
  },
  {
    q: "Do you arrange meditation sessions with monks?",
    a: "Yes — we partner with Thai, Tibetan, and Vipassana centres in Bodh Gaya and Rajgir for half-day to multi-day retreats.",
  },
  {
    q: "Are vegetarian / Buddhist-friendly meals available?",
    a: "All our Buddhist Circuit packages serve sattvic vegetarian meals with Asian options on request. Halal, vegan, and Jain meals can be arranged.",
  },
];

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Buddhist Circuit Sites in Bihar",
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

function matchesBuddhist(pkg: Package): boolean {
  const themes = pkg.categories
    .filter((c) => c.kind === "THEME")
    .map((c) => c.name.toLowerCase());
  const dests = pkg.destinations.map((d) => d.slug);
  if (themes.some((n) => n.includes("buddhist") || n.includes("buddha"))) return true;
  return dests.some((s) =>
    ["bodh-gaya", "nalanda", "rajgir", "vaishali", "kesariya"].includes(s)
  );
}

export default function BuddhistToursPage() {
  const packagesQ = useQuery({
    queryKey: ["packages", "public"],
    queryFn: () => packageService.list(),
  });

  const buddhistPackages = (packagesQ.data ?? []).filter(matchesBuddhist).slice(0, 6);

  return (
    <div className="min-h-screen bg-background theme-page theme-page-buddhist">
      <SEO
        title="Buddhist Circuit Tours — Bodh Gaya, Nalanda, Rajgir & Vaishali"
        description="Walk the path of the Buddha — Bodh Gaya, Nalanda, Rajgir, Vaishali, Kesariya. Multi-day Buddhist Circuit tours with monastery stays, meditation sessions, and expert Dhamma guides."
        keywords="Buddhist circuit tour, Bodh Gaya pilgrimage, Nalanda tour, Rajgir Buddhist site, Vaishali, Kesariya stupa, Buddha trail Bihar"
        jsonLd={[itemListLd, faqLd]}
      />

      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sunsetBodhgayaImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-background" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Walk where the Buddha walked
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Buddhist Circuit Tours
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              From the Bodhi Tree of enlightenment to the ruins of Nalanda — retrace the
              footsteps of the Buddha through Bihar's most sacred sites.
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
                  Build Custom Tour
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            The Eight Great Places
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            In the Mahaparinibbana Sutta, the Buddha named the four most sacred places
            every Buddhist should visit in their lifetime — and Bihar holds three of
            them. Together with Nalanda, Rajgir, Vaishali and Kesariya, this is the
            most concentrated Buddhist heritage region in the world.
          </p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Sacred Sites on the Circuit
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

      {buddhistPackages.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Recommended Buddhist Tours
                </h2>
                <p className="text-muted-foreground">
                  Curated multi-day packages led by experienced Dhamma guides
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
              {buddhistPackages.map((pkg) => (
                <PackageCardLarge key={pkg.id} pkg={pkg} fallbackImage={bodhGayaSharedImg} />
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
              Ready to walk the Buddha's path?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Tell us your dates and group size — we'll design a personalised circuit
              with monastery stays and expert guides.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/customize">
                <Button variant="hero" size="lg">
                  Plan My Circuit
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
