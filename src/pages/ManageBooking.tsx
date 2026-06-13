import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Mail, ArrowRight, Search, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { bookingService } from "@/api/services/bookingService";

export default function ManageBookingPage() {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const idNum = Number(bookingId.trim().replace(/^#/, ""));
        if (!idNum || idNum < 1) {
            setError("Please enter a valid Booking ID.");
            return;
        }
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        setSubmitting(true);
        try {
            const { token } = await bookingService.lookup(idNum, email.trim());
            navigate(`/booking/${token}`);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 429) {
                setError("Too many lookups in a short time. Please wait a minute and try again.");
            } else if (status === 404) {
                setError("We couldn't find a booking matching those details. Double-check the ID and email from your confirmation email.");
            } else {
                setError("Something went wrong. Please try again or contact support.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Manage Booking"
                description="Look up your Magadh Explora booking using your Booking ID and email. No login required."
            />

            <section className="pt-24 pb-12 bg-gradient-warm relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl mx-auto text-center py-8"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            <Search className="w-3.5 h-3.5" />
                            Booking Lookup
                        </span>
                        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
                            Manage Your Booking
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your Booking ID and email — we'll take you straight to your booking details. No password required.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-card rounded-2xl shadow-medium p-6 space-y-5"
                        >
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-primary" />
                                    Booking ID *
                                </label>
                                <Input
                                    value={bookingId}
                                    onChange={(e) => setBookingId(e.target.value)}
                                    placeholder="e.g. 42 or #42"
                                    autoComplete="off"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Found at the top of your confirmation email
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    Email *
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="The email you used at booking"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting}
                                variant="hero"
                                size="lg"
                                className="w-full"
                            >
                                {submitting ? "Looking up…" : "View My Booking"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        <div className="mt-6 bg-muted/40 rounded-xl p-4 text-sm">
                            <p className="flex items-start gap-2 text-muted-foreground">
                                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>
                                    Lost your confirmation email?{" "}
                                    <Link to="/contact" className="text-primary font-medium hover:underline">
                                        Contact support
                                    </Link>{" "}
                                    and we'll help you find your booking.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
