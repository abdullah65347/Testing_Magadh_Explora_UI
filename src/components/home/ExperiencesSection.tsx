import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Landmark,
    Sparkles,
    Mountain,
    Users,
    BookOpen,
    ArrowRight,
} from "lucide-react";

const EXPERIENCES = [
    {
        icon: Landmark,
        title: "Heritage Tours",
        desc: "Explore ancient monuments and sites",
    },
    {
        icon: Sparkles,
        title: "Spiritual Journeys",
        desc: "Follow the path of Buddha & Mahavira",
    },
    {
        icon: Mountain,
        title: "Nature & Adventure",
        desc: "Trekking, ropeway and scenic views",
    },
    {
        icon: Users,
        title: "Local Experiences",
        desc: "Taste local cuisine and meet people",
    },
    {
        icon: BookOpen,
        title: "Cultural Immersion",
        desc: "Festivals, traditions and art of Bihar",
    },
];

export function ExperiencesSection() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-3">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-3">
                            <Sparkles className="w-4 h-4" />
                            Unforgettable Experiences
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                            <span className="text-primary">Experiences</span> We Offer
                        </h2>
                    </div>
                    <Link
                        to="/packages"
                        className="text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all group"
                    >
                        View All Experiences
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                    {EXPERIENCES.map((e, idx) => {
                        const Icon = e.icon;
                        return (
                            <motion.div
                                key={e.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.06 }}
                                className="text-center group"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground text-primary flex items-center justify-center transition-all">
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-display font-bold text-foreground text-base mb-2">
                                    {e.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {e.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
