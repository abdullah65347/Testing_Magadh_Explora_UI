import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    Users,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Smartphone,
    Wallet,
    Clock,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/api/services/bookingService";
import type { Package } from "@/api/services/packageService";
import AuthModal from "@/components/AuthModal";
import { useFormAbandonment } from "@/hooks/useFormAbandonment";
import { track } from "@/lib/analytics";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pkg: Package;
}

type Step = 1 | 2 | 3;

const PAYMENT_METHODS = [
    {
        id: "RAZORPAY",
        label: "Razorpay",
        icon: CreditCard,
        comingSoon: true,
        desc: "Cards, UPI, wallets, net banking",
    },
    {
        id: "STRIPE",
        label: "Stripe",
        icon: CreditCard,
        comingSoon: true,
        desc: "International cards",
    },
    {
        id: "UPI",
        label: "UPI",
        icon: Smartphone,
        comingSoon: true,
        desc: "PhonePe, Google Pay, Paytm",
    },
    {
        id: "PAY_LATER",
        label: "Pay Later",
        icon: Clock,
        comingSoon: false,
        desc: "Reserve now, pay at office or via bank transfer",
    },
] as const;

export function BookNowModal({ isOpen, onClose, pkg }: Props) {
    const { toast } = useToast();
    const { formatPrice, currency } = useCurrency();
    const { user } = useAuth();
    const [signupOpen, setSignupOpen] = useState(false);

    const [step, setStep] = useState<Step>(1);
    const [contact, setContact] = useState({
        name: "",
        email: "",
        phone: "",
        numTravelers: 2,
        travelDate: "",
        specialRequests: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [viewToken, setViewToken] = useState<string | null>(null);

    useFormAbandonment({
        source: "book-now-modal",
        formState: {
            ...contact,
            packageSlug: pkg.slug,
            packageTitle: pkg.title,
            reachedStep: step,
            paymentMethod: paymentMethod ?? undefined,
        },
        submitted: bookingId !== null,
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setBookingId(null);
            setViewToken(null);
            setPaymentMethod(null);
            setSubmitting(false);
            void track({ eventType: "form_start", properties: { form: "book_now", packageId: pkg.id } });
        }
    }, [isOpen, pkg.id]);

    const totalAmount = useMemo(
        () => Number(pkg.priceInr) * contact.numTravelers,
        [pkg.priceInr, contact.numTravelers]
    );

    const canProceedFromStep1 = contact.name.trim() && contact.email.trim() && contact.numTravelers >= 1;
    const canConfirm = !!paymentMethod && PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.comingSoon === false;

    const handleNext = () => {
        if (step === 1 && !canProceedFromStep1) {
            toast({
                title: "Missing fields",
                description: "Name, email and traveler count are required.",
                variant: "destructive",
            });
            return;
        }
        setStep((s) => Math.min(3, s + 1) as Step);
    };

    const handleConfirm = async () => {
        if (!paymentMethod || !canConfirm) return;
        setSubmitting(true);
        try {
            const saved = await bookingService.submit({
                packageId: pkg.id,
                name: contact.name.trim(),
                email: contact.email.trim(),
                phone: contact.phone.trim() || undefined,
                numTravelers: contact.numTravelers,
                travelDate: contact.travelDate || null,
                currency,
                paymentMethod,
                specialRequests: contact.specialRequests.trim() || undefined,
            });
            setBookingId(saved.id);
            setViewToken(saved.viewToken ?? null);
            setStep(3);
            void track({
                eventType: "form_submit",
                properties: {
                    form: "book_now",
                    email: contact.email.trim(),
                    packageId: pkg.id,
                    bookingId: saved.id,
                    paymentMethod,
                    amountInr: totalAmount,
                },
            });
            toast({
                title: "Booking confirmed!",
                description: `Booking #${saved.id} created. Check your email for details.`,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Could not book",
                description: "Please try again or contact us directly.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSelect = (id: string, comingSoon: boolean) => {
        if (comingSoon) {
            toast({
                title: `${PAYMENT_METHODS.find((m) => m.id === id)?.label} — Coming Soon`,
                description: "This payment method will be available shortly. Please use Pay Later for now.",
            });
            return;
        }
        setPaymentMethod(id);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                    />

                    <div
                        className="fixed inset-0 flex items-center justify-center p-4 z-50"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="border-b border-border p-5 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-foreground">
                                        Book Now
                                    </h2>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {pkg.title}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Progress */}
                            {step < 3 && (
                                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                                    {[1, 2].map((n) => (
                                        <div key={n} className="flex items-center gap-2 flex-1">
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                                                    step >= n
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {step > n ? <CheckCircle className="w-4 h-4" /> : n}
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-xs font-medium",
                                                    step >= n ? "text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                {n === 1 ? "Your Details" : "Payment"}
                                            </span>
                                            {n === 1 && <div className="flex-1 h-px bg-border ml-2" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Body */}
                            <div className="overflow-y-auto p-5 flex-1">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-primary" />
                                                    Full Name *
                                                </label>
                                                <Input
                                                    value={contact.name}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, name: e.target.value })
                                                    }
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                    Email *
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={contact.email}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, email: e.target.value })
                                                    }
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                                <p className="text-[10px] text-muted-foreground leading-tight">
                                                    By providing your details, you consent to be contacted by Magadh Explora.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-primary" />
                                                    Phone
                                                </label>
                                                <PhoneInput
                                                    value={contact.phone}
                                                    onChange={(v) =>
                                                        setContact({ ...contact, phone: v })
                                                    }
                                                    placeholder="98765 43210"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    Preferred Travel Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={contact.travelDate}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, travelDate: e.target.value })
                                                    }
                                                    min={new Date().toISOString().split("T")[0]}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Users className="w-4 h-4 text-primary" />
                                                Number of Travelers *
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={contact.numTravelers}
                                                onChange={(e) =>
                                                    setContact({
                                                        ...contact,
                                                        numTravelers: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Special Requests</label>
                                            <Textarea
                                                placeholder="Dietary needs, accessibility, language preference…"
                                                rows={3}
                                                value={contact.specialRequests}
                                                onChange={(e) =>
                                                    setContact({ ...contact, specialRequests: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="bg-muted/40 rounded-xl p-4 mt-3">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Estimated total ({contact.numTravelers} × {formatPrice(Number(pkg.priceInr))})
                                            </p>
                                            <p className="text-2xl font-bold text-primary">
                                                {formatPrice(totalAmount)}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-gradient-warm rounded-xl p-4 mb-2">
                                            <p className="text-xs text-muted-foreground">Total amount</p>
                                            <p className="text-3xl font-bold text-primary">
                                                {formatPrice(totalAmount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                For {contact.numTravelers} traveler(s) · {pkg.title}
                                            </p>
                                        </div>

                                        <h3 className="font-semibold text-foreground mb-2">
                                            Choose a payment method
                                        </h3>

                                        <div className="space-y-2.5">
                                            {PAYMENT_METHODS.map((m) => {
                                                const Icon = m.icon;
                                                const selected = paymentMethod === m.id;
                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => handlePaymentSelect(m.id, m.comingSoon)}
                                                        disabled={m.comingSoon}
                                                        className={cn(
                                                            "w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                                                            selected
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50",
                                                            m.comingSoon && "opacity-60 cursor-not-allowed hover:border-border"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                selected
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted text-foreground"
                                                            )}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground">
                                                                    {m.label}
                                                                </span>
                                                                {m.comingSoon && (
                                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                                                                        Coming Soon
                                                                    </span>
                                                                )}
                                                                {!m.comingSoon && (
                                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
                                                                        Available
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                                {m.desc}
                                                            </p>
                                                        </div>
                                                        {selected && (
                                                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2 mt-4">
                                            <Wallet className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-muted-foreground">
                                                <strong className="text-foreground">Pay Later</strong> reserves your
                                                spot. Our team will contact you within 24 hours with payment details
                                                (bank transfer or in-office). No charge happens now.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", duration: 0.6 }}
                                            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5"
                                        >
                                            <CheckCircle className="w-12 h-12 text-green-600" />
                                        </motion.div>

                                        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                                            Booking Confirmed!
                                        </h3>
                                        {bookingId && (
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Booking ID: <strong className="text-foreground">#{bookingId}</strong>
                                            </p>
                                        )}

                                        <div className="bg-muted/40 rounded-xl p-4 mx-auto max-w-md text-left text-sm space-y-2 mb-5">
                                            <p>
                                                <strong>Package:</strong> {pkg.title}
                                            </p>
                                            <p>
                                                <strong>Travelers:</strong> {contact.numTravelers}
                                            </p>
                                            {contact.travelDate && (
                                                <p>
                                                    <strong>Travel date:</strong> {contact.travelDate}
                                                </p>
                                            )}
                                            <p>
                                                <strong>Total:</strong> {formatPrice(totalAmount)}
                                            </p>
                                            <p>
                                                <strong>Payment:</strong>{" "}
                                                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                                            </p>
                                        </div>

                                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                            <Sparkles className="w-4 h-4 text-primary inline mr-1" />
                                            A confirmation email with the package brochure has been sent to{" "}
                                            <strong className="text-foreground">{contact.email}</strong>.
                                        </p>

                                        {viewToken && (
                                            <a
                                                href={`/booking/${viewToken}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block"
                                            >
                                                <Button variant="hero" className="mb-3">
                                                    View My Booking
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </a>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Our team will be in touch within 24 hours. No login needed —
                                            bookmark the link above to check status anytime.
                                        </p>

                                        {!user && (
                                            <div className="mt-6 mx-auto max-w-md rounded-xl bg-gradient-warm border border-primary/20 p-4 text-left">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground text-sm">
                                                            Save your details for next time?
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                                                            Track all your bookings in one place. Takes 10 seconds.
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSignupOpen(true)}
                                                        >
                                                            Create Free Account
                                                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer actions */}
                            <div className="border-t border-border p-4 flex items-center justify-between gap-3">
                                {step === 1 && (
                                    <>
                                        <Button variant="outline" onClick={onClose}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleNext} disabled={!canProceedFromStep1}>
                                            Continue to Payment
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <Button variant="outline" onClick={() => setStep(1)}>
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            variant="hero"
                                            onClick={handleConfirm}
                                            disabled={!canConfirm || submitting}
                                        >
                                            {submitting ? "Confirming…" : "Confirm Booking"}
                                            <CheckCircle className="w-4 h-4 ml-2" />
                                        </Button>
                                    </>
                                )}
                                {step === 3 && (
                                    <Button onClick={onClose} className="ml-auto">
                                        Done
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
            <AuthModal
                isOpen={signupOpen}
                onClose={() => setSignupOpen(false)}
                mode="register"
                initial={{
                    name: contact.name,
                    email: contact.email,
                    mobile: contact.phone,
                }}
                onSwitchMode={() => { /* allow internal switch */ }}
            />
        </AnimatePresence>
    );
}
