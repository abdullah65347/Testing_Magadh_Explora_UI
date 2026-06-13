import { motion } from "framer-motion";
import {
  Compass,
  Shield,
  Users,
  Sparkles,
  Clock,
  HeartHandshake,
  Building,
  Languages
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Customizable Tours",
    description: "Build your perfect itinerary with our dynamic package builder. Choose duration, activities, and accommodations.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Travel with confidence. Our experienced guides and 24/7 support ensure your safety throughout the journey.",
  },
  {
    icon: Users,
    title: "Expert Local Guides",
    description: "Our multilingual guides bring history to life with deep knowledge of Bihar's cultural heritage.",
  },
  {
    icon: Sparkles,
    title: "Premium Experiences",
    description: "From luxury accommodations to VIP access at sacred sites, we create unforgettable moments.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Whether it's a quick weekend trip or an extended pilgrimage, we adapt to your timeline.",
  },
  {
    icon: HeartHandshake,
    title: "Religious Care",
    description: "Special arrangements for Jain and Buddhist travelers including vegetarian meals and prayer times.",
  },
  {
    icon: Building,
    title: "Quality Stays",
    description: "Handpicked hotels and resorts ranging from budget-friendly to luxury 5-star properties.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "We speak your language. Support available in English, Hindi, Japanese, Chinese, and more.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-16 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-heritage opacity-50" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            The Magadh Explora Difference
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We combine local expertise with premium service to create travel
            experiences that transform and inspire
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-card h-full p-6 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-transparent hover:border-primary/20">
                <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
