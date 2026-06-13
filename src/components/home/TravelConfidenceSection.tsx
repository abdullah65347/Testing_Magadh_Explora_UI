import { motion } from "framer-motion";
import { CheckCircle, Shield } from "lucide-react";
import {
    meditationRajgirImg,
    nalandaUniversityImg,
    sunsetBodhgayaImg,
} from "@/assets/assets";

const BULLETS = [
    "Expert Local Guides",
    "Curated Itineraries",
    "Comfortable Stay Options",
    "24/7 Customer Support",
];

const HIGHLIGHTS = [
    {
        image: meditationRajgirImg,
        title: "Authentic Experiences",
        desc: "Stay close to the heart of every destination",
    },
    {
        image: nalandaUniversityImg,
        title: "Rich Cultural Heritage",
        desc: "1,800 years of empires, art and learning",
    },
    {
        image: sunsetBodhgayaImg,
        title: "Spiritual Connection",
        desc: "Pilgrimage sites of Buddha and Mahavira",
    },
];

export function TravelConfidenceSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-5 gap-10 items-center">
                    {/* Left — copy + checklist */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                            <Shield className="w-4 h-4" />
                            Why Travel With Us?
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
                            Travel with <span className="text-primary">Confidence</span>
                        </h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We are committed to providing authentic, safe and memorable travel
                            experiences across Magadh.
                        </p>

                        <ul className="space-y-3">
                            {BULLETS.map((b) => (
                                <li key={b} className="flex items-center gap-3 text-foreground">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4" />
                                    </span>
                                    <span className="font-medium">{b}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right — 3 highlight cards */}
                    <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
                        {HIGHLIGHTS.map((h, idx) => (
                            <motion.div
                                key={h.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: 0.1 + idx * 0.1 }}
                                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow group"
                            >
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={h.image}
                                        alt={h.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-display font-bold text-foreground mb-1">
                                        {h.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {h.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
