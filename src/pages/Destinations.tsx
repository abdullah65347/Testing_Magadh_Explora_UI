import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Camera,
  Utensils,
  ArrowRight,
  Star,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

import bodhGayaImg from "@/assets/bodh-gaya.jpg";
import rajgirImg from "@/assets/rajgir.jpg";
import pawapuriImg from "@/assets/pawapuri.jpg";
import nalandaImg from "@/assets/nalanda.jpg";
import kesariyaImg from "@/assets/kesariya.jpg";
import heroImg from "@/assets/hero-nalanda.jpg";
import { destinationCover } from "@/assets/assets";
import { SEO } from "@/components/SEO";

const destinations = [
  {
    id: "1",
    name: "Bodh Gaya",
    subtitle: "The Enlightenment Ground",
    description: "Where Siddhartha Gautama attained enlightenment under the Bodhi Tree, becoming Buddha. A UNESCO World Heritage Site and the most important Buddhist pilgrimage destination.",
    image: bodhGayaImg,
    rating: 4.9,
    bestTime: "October - March",
    duration: "2-3 days recommended",
    highlights: ["Mahabodhi Temple", "Bodhi Tree", "Great Buddha Statue", "Various Monasteries"],
    type: "Buddhist",
  },
  {
    id: "2",
    name: "Rajgir",
    subtitle: "Ancient Capital of Magadha",
    description: "Historic city surrounded by five hills, serving as the first capital of the Magadha empire. Famous for hot springs, Vulture Peak, and the peace pagoda.",
    image: rajgirImg,
    rating: 4.8,
    bestTime: "October - March",
    duration: "2 days recommended",
    highlights: ["Gridhakuta Hill", "Hot Springs", "Venuvana", "Peace Pagoda", "Ropeway"],
    type: "Heritage",
  },
  {
    id: "3",
    name: "Nalanda",
    subtitle: "World's First University",
    description: "Ruins of the ancient Nalanda Mahavihara, one of the world's first residential universities. A UNESCO World Heritage Site representing the zenith of Buddhist learning.",
    image: nalandaImg,
    rating: 4.9,
    bestTime: "October - March",
    duration: "1-2 days recommended",
    highlights: ["University Ruins", "Nalanda Museum", "Xuanzang Memorial", "Archaeological Site"],
    type: "Heritage",
  },
  {
    id: "4",
    name: "Pawapuri",
    subtitle: "Jain Tirth - Jal Mandir",
    description: "Sacred Jain pilgrimage site where Lord Mahavira attained Moksha. The iconic Jal Mandir temple sits beautifully in the middle of a lotus pond.",
    image: pawapuriImg,
    rating: 4.8,
    bestTime: "October - March",
    duration: "1 day recommended",
    highlights: ["Jal Mandir", "Samosharan Temple", "Lotus Pond"],
    type: "Jain",
  },
  {
    id: "5",
    name: "Kesariya",
    subtitle: "World's Tallest Stupa",
    description: "Home to the tallest Buddhist stupa in the world, dating back to the Mauryan period. An archaeological marvel still being excavated.",
    image: kesariyaImg,
    rating: 4.6,
    bestTime: "October - March",
    duration: "Half day",
    highlights: ["Great Stupa", "Archaeological Site", "Buddha Footprints"],
    type: "Buddhist",
  },
  {
    id: "6",
    name: "Vaishali",
    subtitle: "World's First Republic",
    description: "Birthplace of democracy and the last sermon location of Lord Buddha. Also significant in Jain history as Lord Mahavira's birthplace.",
    image: heroImg,
    rating: 4.7,
    bestTime: "October - March",
    duration: "1 day recommended",
    highlights: ["Ashoka Pillar", "Buddha Relic Stupa", "Coronation Tank", "Jain Shrines"],
    type: "Mixed",
  },
];

export default function Destinations() {
  const { id } = useParams();

  // If specific destination is selected
  if (id) {
    const destination = destinations.find((d) => d.id === id);
    if (!destination) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="pt-24 pb-12 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground">Destination not found</h1>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px]">
          <img
            src={destination.image}
            alt={destination.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="">
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4",
                destination.type === "Buddhist" ? "bg-accent text-accent-foreground" :
                  destination.type === "Jain" ? "bg-primary text-primary-foreground" :
                    "bg-secondary text-secondary-foreground"
              )}>
                {destination.type}
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-2">
                {destination.name}
              </h1>
              <p className="text-xl text-primary-foreground/80">{destination.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">About {destination.name}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {destination.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Key Highlights</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {destination.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <Camera className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-medium">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-gold" />
                      <span className="text-foreground">{destination.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{destination.bestTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{destination.duration}</span>
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="w-full" size="lg" asChild>
                  <Link to="/customize">
                    Plan Your Visit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sacred Destinations of Bihar — Bodh Gaya, Nalanda, Rajgir, Pawapuri"
        description="Explore the sacred destinations of Bihar: Bodh Gaya, Nalanda, Rajgir, Vaishali, Kesariya and Pawapuri. UNESCO World Heritage Sites and ancient Buddhist & Jain pilgrimage destinations."
        keywords="Bodh Gaya, Nalanda University, Rajgir, Vaishali, Pawapuri, Kesariya stupa, Bihar destinations"
      />
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${destinationCover})` }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-8"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover Bihar's Treasures
            </h1>
            <p className="text-white text-lg">
              Explore ancient cities, sacred temples, and UNESCO World Heritage Sites
              in the heartland of Buddhism and Jainism
            </p>
          </motion.div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/destinations/${dest.id}`} className="block group">
                  <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                      <span className={cn(
                        "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold",
                        dest.type === "Buddhist" ? "bg-accent text-accent-foreground" :
                          dest.type === "Jain" ? "bg-primary text-primary-foreground" :
                            "bg-secondary text-secondary-foreground"
                      )}>
                        {dest.type}
                      </span>

                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-xs font-semibold">{dest.rating}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-primary mb-3">{dest.subtitle}</p>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {dest.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {dest.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {dest.bestTime.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
