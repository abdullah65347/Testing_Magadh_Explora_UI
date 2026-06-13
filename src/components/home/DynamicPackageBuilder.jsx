import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export function DynamicPackageBuilder() {
    const { t } = useLanguage();
    const [duration, setDuration] = useState(5);
    const [travelers, setTravelers] = useState(2);

    const basePrice = 2000;
    const estimatedPrice = basePrice * duration * travelers * 0.85;

    return (
        <section className="py-16 bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 pattern-heritage opacity-30" />

            <div className="container mx-auto px-4 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Sliders className="w-4 h-4" />
                        Build Your Trip
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Create Your Perfect Journey
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Customize every aspect of your Bihar adventure
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-3xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-large"
                >
                    {/* Duration Slider */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                            <Clock className="w-5 h-5 text-primary" />
                            Duration: <span className="text-primary font-bold">{duration} days</span>
                        </label>
                        <input
                            type="range"
                            min={2}
                            max={14}
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            style={{
                                "--progress": `${((duration - 2) / (14 - 2)) * 100}%`,
                            }}
                            className="w-full duration-slider"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>2 days</span>
                            <span>14 days</span>

                        </div>
                    </div>

                    {/* Travelers Slider */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                            <Users className="w-5 h-5 text-primary" />
                            Travelers: <span className="text-primary font-bold">{travelers}</span>
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={20}
                            value={travelers}
                            onChange={(e) => setTravelers(Number(e.target.value))}
                            style={{
                                "--progress": `${((travelers - 1) / (20 - 1)) * 100}%`,
                            }}
                            className="w-full duration-slider"
                        />

                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>1 person</span>
                            <span>20 people</span>
                        </div>
                    </div>

                    {/* Estimated Price */}
                    <div className="bg-muted/50 rounded-2xl p-6 mb-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Estimated Total</p>
                        <p className="text-4xl font-bold text-primary font-mono">
                            ₹{Math.round(estimatedPrice).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            ₹{Math.round(estimatedPrice / travelers).toLocaleString()} per person
                        </p>
                    </div>

                    <Button size="lg" className="w-full" asChild>
                        <Link to="/customize">
                            Customize Full Package
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}


// import { Button } from "@/components/ui/button";
// import {
//     ArrowRight,
//     Sparkles,
//     Users,
//     Calendar,
//     MapPin,
// } from "lucide-react";
// import { Link } from "react-router-dom";

// const steps = [
//     {
//         icon: MapPin,
//         title: "Choose Destinations",
//         description: "Pick from 15+ historic destinations across Bihar",
//     },
//     {
//         icon: Calendar,
//         title: "Set Your Duration",
//         description: "Flexible 1 to N day trips, no fixed limits",
//     },
//     {
//         icon: Users,
//         title: "Select Traveler Type",
//         description: "Solo, couple, family, school, or corporate",
//     },
//     {
//         icon: Sparkles,
//         title: "Customize Everything",
//         description: "Meals, hotels, activities, special experiences",
//     },
// ];

// export function DynamicPackageBuilder() {
//     return (
//         <section className="py-24 px-4">
//             <div className="mx-auto max-w-7xl">
//                 <div className="relative overflow-hidden rounded-3xl bg-espresso p-8 md:p-16 shadow-large">

//                     {/* Decorative glows */}
//                     <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
//                     <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

//                     <div className="relative">
//                         {/* Header */}
//                         <div className="text-center">
//                             <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
//                                 <Sparkles className="h-3.5 w-3.5 text-primary" />
//                                 Dynamic Package Builder
//                             </span>

//                             <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl text-balance">
//                                 Build Your Perfect Trip
//                             </h2>

//                             <p className="mx-auto mt-3 max-w-xl text-base text-white/80">
//                                 Our dynamic package builder lets you create a fully customized
//                                 travel experience with real-time pricing.
//                             </p>
//                         </div>

//                         {/* Steps */}
//                         <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
//                             {steps.map((step, i) => (
//                                 <div
//                                     key={step.title}
//                                     className="flex flex-col items-center text-center"
//                                 >
//                                     <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
//                                         <step.icon className="h-6 w-6 text-primary" />
//                                     </div>

//                                     <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
//                                         {i + 1}
//                                     </div>

//                                     <h3 className="mt-4 font-serif text-lg font-semibold text-white">
//                                         {step.title}
//                                     </h3>

//                                     <p className="mt-1 text-sm text-white/75">
//                                         {step.description}
//                                     </p>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* CTA */}
//                         <div className="mt-16 text-center">
//                             <Button
//                                 asChild
//                                 size="lg"
//                                 className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-base shadow-glow"
//                             >
//                                 <Link to="/builder">
//                                     Start Building
//                                     <ArrowRight className="ml-2 h-4 w-4" />
//                                 </Link>
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }
