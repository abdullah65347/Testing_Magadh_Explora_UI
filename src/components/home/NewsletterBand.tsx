import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function NewsletterBand() {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitting(true);
        setTimeout(() => {
            toast({
                title: "Subscribed!",
                description: "We'll keep you posted on new tours and offers.",
            });
            setEmail("");
            setSubmitting(false);
        }, 400);
    };

    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-orange-700 p-6 md:p-10 text-primary-foreground"
                >
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />

                    <div className="relative grid md:grid-cols-2 gap-6 items-center">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-display text-xl md:text-2xl font-bold mb-1">
                                    Stay Updated with Magadh Explora
                                </h3>
                                <p className="text-sm text-primary-foreground/85">
                                    Get travel inspiration, exclusive offers and updates straight to
                                    your inbox.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="bg-primary-foreground/95 text-foreground border-0 placeholder:text-muted-foreground/70 h-11"
                            />
                            <Button
                                type="submit"
                                disabled={submitting}
                                variant="secondary"
                                size="lg"
                                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                            >
                                {submitting ? "Subscribing…" : "Subscribe"}
                                <Send className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
