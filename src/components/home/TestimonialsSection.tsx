import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "PS",
    rating: 5,
    text: "An absolutely transformative experience! The Buddhist Circuit tour was meticulously planned. Our guide's knowledge of the history and spiritual significance of each site was remarkable. The meditation sessions at Bodh Gaya will stay with me forever.",
    package: "Buddhist Circuit Premium",
    date: "January 2024",
  },
  {
    id: 2,
    name: "Takeshi Yamamoto",
    location: "Tokyo, Japan",
    avatar: "TY",
    rating: 5,
    text: "私は仏教の聖地を訪れることを夢見ていました。Magadh Exploraのチームは素晴らしいサービスを提供してくれました。日本語を話すガイドがいたことで、すべてが理解しやすくなりました。",
    package: "7-Day Pilgrimage",
    date: "December 2023",
  },
  {
    id: 3,
    name: "Rajesh Jain",
    location: "Ahmedabad, India",
    avatar: "RJ",
    rating: 5,
    text: "The Jain Pilgrimage package exceeded all expectations. The pure vegetarian Jain meals were authentic and delicious. Visiting Pawapuri Jal Mandir during sunrise was a divine experience. Highly recommended for all Jain families!",
    package: "Jain Tirth Yatra",
    date: "November 2023",
  },
  {
    id: 4,
    name: "Sarah Mitchell",
    location: "London, UK",
    avatar: "SM",
    rating: 5,
    text: "As a history enthusiast, visiting Nalanda University ruins was a dream come true. The team at Magadh Explora made sure every detail was perfect. The accommodations were excellent and the local cuisine was a delightful bonus!",
    package: "Heritage Explorer",
    date: "October 2023",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gradient-warm relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 text-primary/5">
        <Quote className="w-64 h-64" />
      </div>
      <div className="absolute bottom-20 right-10 text-primary/5 rotate-180">
        <Quote className="w-48 h-48" />
      </div>

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
            ❤️ Traveler Stories
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real experiences from real travelers who discovered Bihar with us
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-3xl p-8 md:p-12 shadow-large"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {testimonials[currentIndex].avatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {testimonials[currentIndex].location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {testimonials[currentIndex].package}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonials[currentIndex].date}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 rounded-full bg-background shadow-medium flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 rounded-full bg-background shadow-medium flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-primary/30 hover:bg-primary/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
