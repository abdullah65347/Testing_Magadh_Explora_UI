import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import bodhGayaImg from "@/assets/bodh-gaya.jpg";
import rajgirImg from "@/assets/rajgir.jpg";
import pawapuriImg from "@/assets/pawapuri.jpg";
import nalandaImg from "@/assets/nalanda.jpg";
import kesariyaImg from "@/assets/kesariya.jpg";

const destinations = [
  {
    id: 1,
    slug: "bodh-gaya",
    name: "Bodh Gaya",
    description: "Where Buddha attained enlightenment",
    image: bodhGayaImg,
    packages: 12,
    featured: true,
  },
  {
    id: 2,
    slug: "rajgir",
    name: "Rajgir",
    description: "Ancient capital of Magadh",
    image: rajgirImg,
    packages: 8,
    featured: false,
  },
  {
    id: 3,
    slug: "nalanda",
    name: "Nalanda",
    description: "World's first university ruins",
    image: nalandaImg,
    packages: 6,
    featured: false,
  },
  {
    id: 4,
    slug: "pawapuri",
    name: "Pawapuri",
    description: "Sacred Jain pilgrimage site",
    image: pawapuriImg,
    packages: 5,
    featured: false,
  },
  {
    id: 5,
    slug: "kesariya",
    name: "Kesariya",
    description: "World's tallest Buddhist stupa",
    image: kesariyaImg,
    packages: 4,
    featured: false,
  },
];

export function DestinationsSection() {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              Top Destinations
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Explore Bihar's Treasures
            </h2>
          </div>
          <Button variant="outline" size="lg" className="mt-4 md:mt-0" asChild>
            <Link to="/destinations">
              All Destinations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>

        {/* Destinations Grid - Bento Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Featured Large Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 lg:row-span-2"
          >
            <Link to={`/destinations/${destinations[0].slug}`} className="block group h-full">
              <div className="relative h-full min-h-[400px] md:min-h-full rounded-3xl overflow-hidden">
                <img
                  src={destinations[0].image}
                  alt={destinations[0].name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold mb-3">
                    Featured Destination
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                    {destinations[0].name}
                  </h3>
                  <p className="text-primary-foreground/80 mb-4">
                    {destinations[0].description}
                  </p>
                  <div className="flex items-center gap-2 text-primary-foreground/60">
                    <span>{destinations[0].packages} packages available</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Smaller Cards */}
          {destinations.slice(1).map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/destinations/${dest.slug}`} className="block group">
                <div className="relative h-52 md:h-48 rounded-2xl overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-bold text-primary-foreground mb-1">
                      {dest.name}
                    </h3>
                    <p className="text-primary-foreground/70 text-sm line-clamp-1">
                      {dest.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
