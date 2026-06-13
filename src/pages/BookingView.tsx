import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    CheckCircle,
    Clock,
    Calendar,
    Users,
    Mail,
    Phone,
    User as UserIcon,
    ArrowRight,
    Download,
    Copy,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { bookingService } from "@/api/services/bookingService";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:     { bg: "bg-amber-100",  text: "text-amber-800",  label: "Pending Confirmation" },
    NEW:         { bg: "bg-blue-100",   text: "text-blue-800",   label: "New" },
    CONTACTED:   { bg: "bg-blue-100",   text: "text-blue-800",   label: "Our team is in touch" },
    CONFIRMED:   { bg: "bg-green-100",  text: "text-green-800",  label: "Confirmed" },
    IN_PROGRESS: { bg: "bg-indigo-100", text: "text-indigo-800", label: "In Progress" },
    COMPLETED:   { bg: "bg-gray-200",   text: "text-gray-700",   label: "Completed" },
    CONVERTED:   { bg: "bg-green-100",  text: "text-green-800",  label: "Confirmed" },
    CLOSED:      { bg: "bg-gray-200",   text: "text-gray-700",   label: "Closed" },
    CANCELLED:   { bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
};

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    UNPAID:   { bg: "bg-amber-100",  text: "text-amber-800",  label: "Unpaid" },
    PARTIAL:  { bg: "bg-yellow-100", text: "text-yellow-800", label: "Partial Payment" },
    PAID:     { bg: "bg-green-100",  text: "text-green-800",  label: "Paid" },
    REFUNDED: { bg: "bg-purple-100", text: "text-purple-800", label: "Refunded" },
    FAILED:   { bg: "bg-red-100",    text: "text-red-800",    label: "Payment Failed" },
};

const PAYMENT_LABEL: Record<string, string> = {
    PAY_LATER: "Pay Later",
    RAZORPAY: "Razorpay",
    STRIPE: "Stripe",
    UPI: "UPI",
};

export default function BookingViewPage() {
    const { token } = useParams<{ token: string }>();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const q = useQuery({
        queryKey: ["booking", "view", token],
        queryFn: () => bookingService.viewByToken(token!),
        enabled: !!token,
        retry: 1,
    });

    if (q.isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center text-muted-foreground">
                Loading your booking…
            </div>
        );
    }

    if (q.isError || !q.data) {
        return (
            <div className="min-h-screen bg-background">
                <SEO title="Booking Not Found" />
                <div className="pt-32 px-4">
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="font-display text-3xl font-bold mb-2">Booking not found</h1>
                        <p className="text-muted-foreground mb-6">
                            The link may have expired or been mistyped. Please check the email we sent you,
                            or contact our team and we'll help.
                        </p>
                        <div className="flex justify-center gap-3 flex-wrap">
                            <Button asChild>
                                <Link to="/">Back to home</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/contact">Contact us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { booking, pkg } = q.data;
    const status = STATUS_STYLES[booking.status] ?? STATUS_STYLES.PENDING;
    const paymentLabel = booking.paymentMethod
        ? PAYMENT_LABEL[booking.paymentMethod] ?? booking.paymentMethod.replace(/_/g, " ")
        : null;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast({ title: "Link copied", description: "Save it somewhere safe." });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Could not copy", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={`Booking #${booking.id}`}
                description={`View your Magadh Explora booking for ${pkg?.title ?? "our tour"}.`}
            />

            {/* Hero strip */}
            <section className="pt-24 pb-10 bg-gradient-warm relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Booking Reference
                                </span>
                                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                    Booking #{booking.id}
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Created {new Date(booking.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold",
                                        status.bg,
                                        status.text
                                    )}
                                >
                                    {status.label}
                                </span>
                                {booking.paymentStatus && PAYMENT_STATUS_STYLES[booking.paymentStatus] && (
                                    <span
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-semibold",
                                            PAYMENT_STATUS_STYLES[booking.paymentStatus].bg,
                                            PAYMENT_STATUS_STYLES[booking.paymentStatus].text
                                        )}
                                    >
                                        💳 {PAYMENT_STATUS_STYLES[booking.paymentStatus].label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Left column — package + booking details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Package card */}
                            {pkg && (
                                <Link
                                    to={`/packages/${pkg.slug}`}
                                    className="block bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {pkg.heroImageUrl && (
                                            <div className="w-full sm:w-48 h-44 sm:h-auto flex-shrink-0">
                                                <img
                                                    src={pkg.heroImageUrl}
                                                    alt={pkg.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 flex-1">
                                            <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">
                                                Your Tour
                                            </p>
                                            <h2 className="font-display text-xl font-bold text-foreground mb-2">
                                                {pkg.title}
                                            </h2>
                                            {pkg.summary && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                    {pkg.summary}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {pkg.durationDays && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {pkg.durationDays} days
                                                    </span>
                                                )}
                                                <span className="text-primary inline-flex items-center gap-1 font-medium">
                                                    View tour <ArrowRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Booking details */}
                            <div className="bg-card rounded-2xl p-6 shadow-soft">
                                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                                    Booking Details
                                </h3>
                                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            Lead Traveler
                                        </dt>
                                        <dd className="font-medium text-foreground">{booking.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            Email
                                        </dt>
                                        <dd className="font-medium text-foreground break-all">{booking.email}</dd>
                                    </div>
                                    {booking.mobile && (
                                        <div>
                                            <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                Phone
                                            </dt>
                                            <dd className="font-medium text-foreground">{booking.mobile}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                            <Users className="w-3.5 h-3.5" />
                                            Travelers
                                        </dt>
                                        <dd className="font-medium text-foreground">{booking.numTravelers}</dd>
                                    </div>
                                    {booking.travelDate && (
                                        <div>
                                            <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Preferred Date
                                            </dt>
                                            <dd className="font-medium text-foreground">
                                                {new Date(booking.travelDate).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    )}
                                    {paymentLabel && (
                                        <div>
                                            <dt className="text-muted-foreground flex items-center gap-1.5 mb-0.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Payment Method
                                            </dt>
                                            <dd className="font-medium text-foreground">{paymentLabel}</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">Total amount</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {booking.currency} {Number(booking.totalAmountLocal).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation callout */}
                            {booking.status === "CANCELLED" && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Booking Cancelled
                                    </h3>
                                    {booking.cancellationReason ? (
                                        <p className="text-sm text-red-800 leading-relaxed">
                                            <strong>Reason:</strong> {booking.cancellationReason}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-800 leading-relaxed">
                                            This booking has been cancelled. If you've already paid, our team
                                            will process your refund as per the cancellation policy.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Payment instructions */}
                            {booking.status !== "CANCELLED" && booking.paymentMethod === "PAY_LATER" && booking.paymentStatus !== "PAID" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Payment Pending
                                    </h3>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        You chose <strong>Pay Later</strong>. Our team will contact you within
                                        24 hours with payment options (bank transfer or in-office). No charge has
                                        happened yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right column — sidebar actions */}
                        <aside className="space-y-4">
                            <div className="bg-card rounded-2xl p-5 shadow-soft sticky top-24">
                                <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>

                                {pkg && (
                                    <a
                                        href={`/api/packages/${pkg.slug}/brochure.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mb-2"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Brochure
                                        </Button>
                                    </a>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full mb-2"
                                    onClick={copyLink}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copied ? "Copied!" : "Copy Booking Link"}
                                </Button>

                                <Button asChild variant="ghost" className="w-full">
                                    <Link to="/contact">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact Support
                                    </Link>
                                </Button>

                                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                        Bookmark this page or save the link from your email — no login required.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
