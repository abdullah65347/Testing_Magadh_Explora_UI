import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import bodhGayaImg from "@/assets/bodh-gaya.jpg";
import pawapuriImg from "@/assets/pawapuri.jpg";

const tours = [
  {
    id: "buddhist",
    title: "Buddhist Circuit",
    subtitle: "Path to Enlightenment",
    description: "Walk in the footsteps of Buddha through Bihar's most sacred Buddhist sites. Our curated pilgrimage includes meditation sessions, dharma talks, and visits to ancient monasteries.",
    image: bodhGayaImg,
    color: "teal",
    features: [
      "Morning meditation sessions",
      "Dharma talks by local monks",
      "Visit to all 8 great places",
      "Monastery stay options",
      "Prayer flag ceremony",
      "Buddhist meal experience",
    ],
    places: ["Bodh Gaya", "Rajgir", "Nalanda", "Vaishali", "Kesariya"],
    link: "/buddhist-tours",
  },
  {
    id: "jain",
    title: "Jain Pilgrimage",
    subtitle: "Sacred Tirth Yatra",
    description: "Experience the serenity of Bihar's holiest Jain sites. From the Jal Mandir at Pawapuri to the birthplace of Lord Mahavira, immerse yourself in Jain spirituality.",
    image: pawapuriImg,
    color: "primary",
    features: [
      "Pure Jain vegetarian meals",
      "Early morning temple visits",
      "Jain priest consultations",
      "Visit to all major tirths",
      "Separate kitchen arrangements",
      "Jain literature & souvenirs",
    ],
    places: ["Pawapuri", "Kundalpur", "Rajgir", "Vaishali", "Mandar Hill"],
    link: "/jain-tours",
  },
];

export function SpecialToursSection() {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✨ Special Religious Tours
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Spiritual Journeys
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dedicated packages for Buddhist and Jain pilgrims with special amenities
            and religious arrangements
          </p>
        </motion.div>

        {/* Tour Cards */}
        <div className="space-y-16">
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
            >
              {/* Image */}
              <div className={`relative ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-large">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                  {/* Places Tags */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {tour.places.map((place) => (
                        <span
                          key={place}
                          className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground"
                        >
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${tour.color === "teal"
                  ? "bg-accent/10 text-accent"
                  : "bg-primary/10 text-primary"
                  }`}>
                  {tour.subtitle}
                </span>

                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {tour.title}
                </h3>

                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {tour.description}
                </p>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {tour.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${tour.color === "teal"
                        ? "bg-accent/20 text-accent"
                        : "bg-primary/20 text-primary"
                        }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={tour.color === "teal" ? "spiritual" : "premium"}
                  size="lg"
                  asChild
                >
                  <Link to={tour.link}>
                    Explore {tour.title}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
