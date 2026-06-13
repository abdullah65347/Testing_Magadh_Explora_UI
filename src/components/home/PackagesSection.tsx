import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, Users, Sparkles, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import bodhGayaImg from "@/assets/bodh-gaya.jpg";
import rajgirImg from "@/assets/rajgir.jpg";
import pawapuriImg from "@/assets/pawapuri.jpg";
import nalandaImg from "@/assets/nalanda.jpg";

const packages = [
  {
    id: 1,
    title: "Buddhist Circuit Premium",
    description: "A transformative spiritual journey through the sacred Buddhist sites of Bihar",
    image: bodhGayaImg,
    duration: "7 Days",
    groupSize: "2-15",
    rating: 4.9,
    reviews: 234,
    price: 45000,
    originalPrice: 55000,
    tag: "Most Popular",
    type: "premium",
    highlights: ["Bodh Gaya", "Rajgir", "Nalanda", "Vaishali"],
  },
  {
    id: 2,
    title: "Blissful Bihar Package",
    description: "Immerse yourself in authentic Bihar culture, heritage sites, and delicious local cuisine across 4-8 days",
    image: nalandaImg,
    duration: "6 Days",
    groupSize: "2-20",
    rating: 4.9,
    reviews: 312,
    price: 32000,
    originalPrice: 40000,
    tag: "Culture & Food",
    type: "culture",
    highlights: ["Rajgir", "Gaya", "Nalanda", "Patna"],
  },
  {
    id: 3,
    title: "Jain Pilgrimage Tour",
    description: "Visit the holiest Jain tirths including Pawapuri and Kundalpur",
    image: pawapuriImg,
    duration: "5 Days",
    groupSize: "2-20",
    rating: 4.8,
    reviews: 156,
    price: 35000,
    originalPrice: 42000,
    tag: "Spiritual",
    type: "spiritual",
    highlights: ["Pawapuri", "Kundalpur", "Rajgir", "Vaishali"],
  },
  {
    id: 4,
    title: "Adventure & Heritage",
    description: "Explore ancient forts, hot springs, and scenic landscapes of Bihar",
    image: rajgirImg,
    duration: "4 Days",
    groupSize: "2-12",
    rating: 4.7,
    reviews: 189,
    price: 28000,
    originalPrice: 32000,
    tag: "Adventure",
    type: "adventure",
    highlights: ["Rajgir", "Rohtasgarh", "Sasaram", "Gaya"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function PackagesSection() {
  return (
    <section className="py-24 bg-gradient-warm relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
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
            Popular Travel Packages
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from our carefully crafted travel experiences designed to immerse
            you in Bihar's rich cultural heritage
          </p>
        </motion.div>

        {/* Package Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 xl2:grid-cols-4 gap-6"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                  {/* Tag */}
                  <span
                    className={cn(
                      "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold",
                      pkg.type === "premium" && "bg-gradient-gold text-primary-foreground",
                      pkg.type === "spiritual" && "bg-gradient-spiritual text-primary-foreground",
                      pkg.type === "adventure" && "bg-secondary text-secondary-foreground",
                      pkg.type === "culture" && "bg-gradient-premium text-primary-foreground"
                    )}
                  >
                    {pkg.tag}
                  </span>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                    <span className="text-xs font-semibold text-foreground">{pkg.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.highlights.map((place) => (
                      <span
                        key={place}
                        className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                      >
                        {place}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {pkg.groupSize} people
                    </span>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-auto flex items-end justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{pkg.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link to="/customize">
                      <Button size="sm" className="group/btn">
                        View
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
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
