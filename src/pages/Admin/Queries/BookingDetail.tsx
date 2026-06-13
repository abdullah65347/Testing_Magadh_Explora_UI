import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Users,
    CreditCard,
    Clock,
    Save,
    AlertCircle,
    ExternalLink,
    CheckCircle,
    Package as PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    bookingService,
    type BookingStatus,
    type PaymentStatus,
} from "@/api/services/bookingService";
import { packageService } from "@/api/services/packageService";
import { cn } from "@/lib/utils";

const STATUSES: BookingStatus[] = ["NEW", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PARTIAL", "PAID", "REFUNDED", "FAILED"];

export default function BookingDetail() {
    const { id } = useParams<{ id: string }>();
    const numId = Number(id);
    const navigate = useNavigate();
    const qc = useQueryClient();

    const bookingQ = useQuery({
        queryKey: ["admin", "bookings", numId],
        queryFn: () => bookingService.adminGet(numId),
        enabled: !!numId,
    });

    const pkgQ = useQuery({
        queryKey: ["admin", "package", bookingQ.data?.packageId],
        queryFn: () => packageService.adminGet(bookingQ.data!.packageId),
        enabled: !!bookingQ.data?.packageId,
    });

    const [notes, setNotes] = useState("");
    useEffect(() => {
        if (bookingQ.data?.internalNotes != null) setNotes(bookingQ.data.internalNotes);
    }, [bookingQ.data?.internalNotes]);

    const saveNotes = useMutation({
        mutationFn: () => bookingService.updateNotes(numId, notes),
        onSuccess: () => {
            toast.success("Notes saved");
            qc.invalidateQueries({ queryKey: ["admin", "bookings", numId] });
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const updateStatus = useMutation({
        mutationFn: (status: BookingStatus) => bookingService.updateStatus(numId, status),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["admin", "bookings", numId] });
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const updatePayment = useMutation({
        mutationFn: (paymentStatus: PaymentStatus) =>
            bookingService.updatePaymentStatus(numId, paymentStatus),
        onSuccess: () => {
            toast.success("Payment status updated");
            qc.invalidateQueries({ queryKey: ["admin", "bookings", numId] });
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const [cancelReason, setCancelReason] = useState("");
    const [cancelOpen, setCancelOpen] = useState(false);
    const cancelMut = useMutation({
        mutationFn: () => bookingService.cancel(numId, cancelReason),
        onSuccess: () => {
            toast.success("Booking cancelled — customer notified by email");
            setCancelOpen(false);
            setCancelReason("");
            qc.invalidateQueries({ queryKey: ["admin", "bookings", numId] });
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Cancel failed"),
    });

    if (bookingQ.isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Loading…</div>;
    }
    if (bookingQ.isError || !bookingQ.data) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-500 mb-4">Booking not found.</p>
                <Button onClick={() => navigate("/admin/queries/bookings")}>Back to bookings</Button>
            </div>
        );
    }

    const b = bookingQ.data;
    const pkg = pkgQ.data;
    const isCancelled = b.status === "CANCELLED";

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center gap-3">
                <Link
                    to="/admin/queries/bookings"
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Booking #{b.id}</h1>
                    <p className="text-sm text-muted-foreground">
                        Created {new Date(b.createdAt).toLocaleString()}
                    </p>
                </div>
                {b.viewToken && (
                    <a
                        href={`/booking/${b.viewToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                        Customer view
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Package */}
                    {pkg && (
                        <Link
                            to={`/admin/packages/${pkg.id}/edit`}
                            className="block bg-card border border-border rounded-lg p-4 hover:shadow-soft transition-shadow"
                        >
                            <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1 flex items-center gap-1">
                                <PackageIcon className="w-3 h-3" /> Package
                            </p>
                            <h2 className="font-semibold text-foreground">{pkg.title}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                ₹{Number(pkg.priceInr).toLocaleString()} / person
                                {pkg.durationDays ? ` · ${pkg.durationDays} days` : ""}
                                {pkg.slug ? ` · ${pkg.slug}` : ""}
                            </p>
                        </Link>
                    )}

                    {/* Customer + Trip details */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Customer & Trip</h3>
                        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <Row label="Name" icon={<></>}>{b.name}</Row>
                            <Row label="Email" icon={<Mail className="w-3.5 h-3.5" />}>
                                <a href={`mailto:${b.email}`} className="text-primary hover:underline">
                                    {b.email}
                                </a>
                            </Row>
                            {b.mobile && (
                                <Row label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                                    <a href={`tel:${b.mobile}`} className="text-primary hover:underline">
                                        {b.mobile}
                                    </a>
                                </Row>
                            )}
                            <Row label="Travelers" icon={<Users className="w-3.5 h-3.5" />}>
                                {b.numTravelers}
                            </Row>
                            {b.travelDate && (
                                <Row label="Travel date" icon={<Calendar className="w-3.5 h-3.5" />}>
                                    {b.travelDate}
                                </Row>
                            )}
                            {b.paymentMethod && (
                                <Row label="Payment method" icon={<CreditCard className="w-3.5 h-3.5" />}>
                                    {b.paymentMethod.replace(/_/g, " ")}
                                </Row>
                            )}
                            <Row label="Total" icon={<></>}>
                                <strong className="text-primary">
                                    ₹{Number(b.totalAmountInr).toLocaleString()}
                                </strong>
                                {b.currency !== "INR" && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({b.currency} {Number(b.totalAmountLocal).toLocaleString()})
                                    </span>
                                )}
                            </Row>
                        </dl>
                    </div>

                    {/* Internal notes */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Internal Notes</h3>
                            <p className="text-xs text-muted-foreground">Admin-only · never shown to customer</p>
                        </div>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={5}
                            placeholder="Track communications, special requests, follow-ups…"
                        />
                        <div className="mt-2 flex justify-end">
                            <Button
                                size="sm"
                                onClick={() => saveNotes.mutate()}
                                disabled={saveNotes.isPending || notes === (b.internalNotes ?? "")}
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                {saveNotes.isPending ? "Saving…" : "Save Notes"}
                            </Button>
                        </div>
                    </div>

                    {/* Cancellation callout */}
                    {isCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-bold text-red-900 flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4" />
                                Cancelled
                            </h3>
                            {b.cancelledAt && (
                                <p className="text-xs text-red-700 mb-2">
                                    On {new Date(b.cancelledAt).toLocaleString()}
                                </p>
                            )}
                            {b.cancellationReason && (
                                <p className="text-sm text-red-800">
                                    <strong>Reason:</strong> {b.cancellationReason}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    {/* Status controls */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold">Status</h3>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Lifecycle</label>
                            <select
                                value={b.status}
                                onChange={(e) => updateStatus.mutate(e.target.value as BookingStatus)}
                                disabled={updateStatus.isPending}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                            {b.confirmedAt && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    Confirmed {new Date(b.confirmedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Payment</label>
                            <select
                                value={b.paymentStatus ?? "UNPAID"}
                                onChange={(e) => updatePayment.mutate(e.target.value as PaymentStatus)}
                                disabled={updatePayment.isPending}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                {PAYMENT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {b.paidAt && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    Paid {new Date(b.paidAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold mb-2">Quick Actions</h3>
                        {!isCancelled && (
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setCancelOpen(true)}
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                            </Button>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                            <a href={`mailto:${b.email}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Email Customer
                            </a>
                        </Button>
                        {b.mobile && (
                            <Button variant="outline" className="w-full" asChild>
                                <a href={`tel:${b.mobile}`}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Customer
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Timeline
                        </h3>
                        <ul className="text-xs space-y-1.5 text-muted-foreground">
                            <li>📩 Created {new Date(b.createdAt).toLocaleString()}</li>
                            {b.confirmedAt && (
                                <li>✅ Confirmed {new Date(b.confirmedAt).toLocaleString()}</li>
                            )}
                            {b.paidAt && (
                                <li>💰 Paid {new Date(b.paidAt).toLocaleString()}</li>
                            )}
                            {b.cancelledAt && (
                                <li className="text-red-600">
                                    ✕ Cancelled {new Date(b.cancelledAt).toLocaleString()}
                                </li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* Cancel modal */}
            {cancelOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                        onClick={() => setCancelOpen(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="font-bold text-lg mb-2">Cancel booking #{b.id}?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {b.name} will receive a cancellation email immediately.
                            </p>
                            <Textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                placeholder="Reason (optional)…"
                                className="mb-4"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setCancelOpen(false)}>
                                    Keep Booking
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => cancelMut.mutate()}
                                    disabled={cancelMut.isPending}
                                >
                                    {cancelMut.isPending ? "Cancelling…" : "Confirm Cancellation"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Row({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                {icon}
                {label}
            </dt>
            <dd className="text-sm text-foreground">{children}</dd>
        </div>
    );
}
