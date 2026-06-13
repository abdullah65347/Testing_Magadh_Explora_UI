import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    Users,
    ArrowRight,
    Clock,
    CheckCircle,
    Package as PackageIcon,
    Plus,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { bookingService, type BookingDto } from "@/api/services/bookingService";
import { packageService, type Package } from "@/api/services/packageService";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:   { bg: "bg-amber-100",  text: "text-amber-800",  label: "Pending" },
    NEW:       { bg: "bg-blue-100",   text: "text-blue-800",   label: "New" },
    CONTACTED: { bg: "bg-blue-100",   text: "text-blue-800",   label: "In Touch" },
    CONFIRMED: { bg: "bg-green-100",  text: "text-green-800",  label: "Confirmed" },
    CONVERTED: { bg: "bg-green-100",  text: "text-green-800",  label: "Confirmed" },
    CLOSED:    { bg: "bg-gray-200",   text: "text-gray-700",   label: "Closed" },
    CANCELLED: { bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
};

export default function MyBookingsPage() {
    const { user, isAuthenticated } = useAuth();
    const { formatPrice } = useCurrency();

    const bookingsQ = useQuery<BookingDto[]>({
        queryKey: ["bookings", "mine"],
        queryFn: bookingService.mine,
        enabled: isAuthenticated,
    });

    const packagesQ = useQuery<Package[]>({
        queryKey: ["packages", "public"],
        queryFn: () => packageService.list(),
        enabled: isAuthenticated,
    });

    const packageMap = useMemo(() => {
        const m = new Map<number, Package>();
        (packagesQ.data ?? []).forEach((p) => m.set(p.id, p));
        return m;
    }, [packagesQ.data]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const bookings = bookingsQ.data ?? [];
    const isLoading = bookingsQ.isLoading;
    const isError = bookingsQ.isError;

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="My Bookings"
                description="View and manage all your Magadh Explora bookings in one place."
            />

            {/* Hero strip */}
            <section className="pt-24 pb-10 bg-gradient-warm relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                                    <PackageIcon className="w-3.5 h-3.5" />
                                    Your Account
                                </span>
                                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                    My Bookings
                                </h1>
                                {user?.name && (
                                    <p className="text-muted-foreground mt-1">
                                        Welcome back, {user.name.split(" ")[0]}
                                    </p>
                                )}
                            </div>
                            <Button asChild variant="hero">
                                <Link to="/packages">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Book Another Tour
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bookings list */}
            <section className="py-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        {isLoading && (
                            <div className="text-center py-16 text-muted-foreground">
                                Loading your bookings…
                            </div>
                        )}

                        {isError && !isLoading && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3 max-w-2xl mx-auto">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900 mb-1">Could not load your bookings</p>
                                    <p className="text-sm text-red-700">
                                        Please try refreshing the page. If the problem persists,{" "}
                                        <Link to="/contact" className="underline">contact support</Link>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !isError && bookings.length === 0 && (
                            <div className="text-center py-16 bg-card rounded-2xl shadow-soft max-w-2xl mx-auto">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <PackageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                    No bookings yet
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Looks like you haven't booked any tours with us. Browse our packages to start
                                    planning your Bihar adventure.
                                </p>
                                <Button asChild variant="hero">
                                    <Link to="/packages">
                                        Explore Packages
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {!isLoading && !isError && bookings.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} total
                                </p>

                                {bookings.map((b, idx) => {
                                    const pkg = packageMap.get(b.packageId);
                                    const status = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
                                    const image =
                                        pkg?.heroImageUrl ||
                                        pkg?.images?.find((i) => i.primary)?.url ||
                                        pkg?.images?.[0]?.url;
                                    return (
                                        <motion.div
                                            key={b.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                                            className="bg-card rounded-2xl shadow-soft hover:shadow-medium transition-shadow overflow-hidden"
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {image && (
                                                    <Link
                                                        to={pkg ? `/packages/${pkg.slug}` : "#"}
                                                        className="w-full md:w-56 h-44 md:h-auto flex-shrink-0 overflow-hidden bg-muted"
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={pkg?.title ?? "Package"}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </Link>
                                                )}

                                                <div className="flex-1 p-5 flex flex-col">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                Booking #{b.id} · {new Date(b.createdAt).toLocaleDateString()}
                                                            </p>
                                                            <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">
                                                                {pkg?.title ?? `Package #${b.packageId}`}
                                                            </h3>
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                                                                status.bg,
                                                                status.text
                                                            )}
                                                        >
                                                            {status.label}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 mt-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {b.numTravelers} {b.numTravelers === 1 ? "traveler" : "travelers"}
                                                        </span>
                                                        {b.travelDate && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(b.travelDate).toLocaleDateString(undefined, {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                        )}
                                                        {b.paymentMethod && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {b.paymentMethod.replace(/_/g, " ")}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-border gap-3 flex-wrap">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Total</p>
                                                            <p className="text-xl font-bold text-primary">
                                                                {pkg
                                                                    ? formatPrice(Number(b.totalAmountInr))
                                                                    : `${b.currency} ${Number(b.totalAmountLocal).toLocaleString()}`}
                                                            </p>
                                                        </div>
                                                        {b.viewToken ? (
                                                            <Link to={`/booking/${b.viewToken}`}>
                                                                <Button size="sm">
                                                                    View Details
                                                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                Details unavailable
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
