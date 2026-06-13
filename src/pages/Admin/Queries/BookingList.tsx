import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, X, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    bookingService,
    type BookingListFilters,
    type BookingStatus,
    type PaymentStatus,
} from "@/api/services/bookingService";
import { cn } from "@/lib/utils";
import api from "@/api/client";

const STATUSES: BookingStatus[] = [
    "NEW",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
    "UNPAID",
    "PARTIAL",
    "PAID",
    "REFUNDED",
    "FAILED",
];

const STATUS_STYLES: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-green-100 text-green-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    // legacy
    PENDING: "bg-amber-100 text-amber-700",
    CONTACTED: "bg-blue-100 text-blue-700",
    CONVERTED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-200 text-gray-700",
};

const PAYMENT_STYLES: Record<string, string> = {
    UNPAID: "bg-amber-100 text-amber-800",
    PARTIAL: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    REFUNDED: "bg-purple-100 text-purple-800",
    FAILED: "bg-red-100 text-red-800",
};

export default function BookingList() {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<Omit<BookingListFilters, "page" | "size">>({});

    const list = useQuery({
        queryKey: ["admin", "bookings", page, filters],
        queryFn: () => bookingService.adminList({ ...filters, page, size: 20 }),
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
            bookingService.updateStatus(id, status),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const updatePayment = useMutation({
        mutationFn: ({ id, paymentStatus }: { id: number; paymentStatus: PaymentStatus }) =>
            bookingService.updatePaymentStatus(id, paymentStatus),
        onSuccess: () => {
            toast.success("Payment status updated");
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const [cancelTarget, setCancelTarget] = useState<{ id: number; name: string } | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const cancelMut = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            bookingService.cancel(id, reason),
        onSuccess: () => {
            toast.success("Booking cancelled — customer notified by email");
            setCancelTarget(null);
            setCancelReason("");
            qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Cancel failed"),
    });

    const hasActiveFilters = useMemo(
        () => Object.values(filters).some((v) => !!v),
        [filters]
    );

    const handleCsvDownload = async () => {
        try {
            const url = bookingService.csvExportUrl(filters);
            const res = await api.get<string>(url, { responseType: "blob" as any });
            const blob = new Blob([res.data as any], { type: "text/csv;charset=utf-8" });
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            toast.error(err?.message ?? "CSV export failed");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold">Bookings</h1>
                <Button variant="outline" size="sm" onClick={handleCsvDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-3 grid sm:grid-cols-4 gap-2">
                <select
                    value={filters.status ?? ""}
                    onChange={(e) => {
                        setPage(0);
                        setFilters({ ...filters, status: e.target.value as any });
                    }}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                </select>

                <select
                    value={filters.paymentStatus ?? ""}
                    onChange={(e) => {
                        setPage(0);
                        setFilters({ ...filters, paymentStatus: e.target.value as any });
                    }}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                    <option value="">All payment statuses</option>
                    {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <Input
                    type="date"
                    value={filters.from ?? ""}
                    onChange={(e) => {
                        setPage(0);
                        setFilters({ ...filters, from: e.target.value });
                    }}
                    className="h-9"
                    placeholder="From"
                />
                <Input
                    type="date"
                    value={filters.to ?? ""}
                    onChange={(e) => {
                        setPage(0);
                        setFilters({ ...filters, to: e.target.value });
                    }}
                    className="h-9"
                    placeholder="To"
                />

                {hasActiveFilters && (
                    <div className="sm:col-span-4">
                        <button
                            onClick={() => {
                                setFilters({});
                                setPage(0);
                            }}
                            className="text-xs text-primary hover:underline inline-flex items-center"
                        >
                            <X className="w-3 h-3 mr-1" /> Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {list.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : list.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load bookings.</div>
                ) : list.data && list.data.content.length > 0 ? (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-3 py-3 font-medium">Date</th>
                                    <th className="px-3 py-3 font-medium">#</th>
                                    <th className="px-3 py-3 font-medium">Customer</th>
                                    <th className="px-3 py-3 font-medium">Pkg</th>
                                    <th className="px-3 py-3 font-medium">Pax</th>
                                    <th className="px-3 py-3 font-medium">Travel</th>
                                    <th className="px-3 py-3 font-medium">Amount</th>
                                    <th className="px-3 py-3 font-medium">Method</th>
                                    <th className="px-3 py-3 font-medium">Status</th>
                                    <th className="px-3 py-3 font-medium">Payment</th>
                                    <th className="px-3 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.data.content.map((b) => (
                                    <tr key={b.id} className="border-t border-border align-top">
                                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                            {new Date(b.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs">#{b.id}</td>
                                        <td className="px-3 py-3">
                                            <div className="font-medium">{b.name}</div>
                                            <div className="text-xs">
                                                <a href={`mailto:${b.email}`} className="text-primary hover:underline">
                                                    {b.email}
                                                </a>
                                            </div>
                                            {b.mobile && (
                                                <div className="text-xs text-muted-foreground">{b.mobile}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-xs text-muted-foreground">
                                            #{b.packageId}
                                        </td>
                                        <td className="px-3 py-3">{b.numTravelers}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            {b.travelDate || "—"}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="font-medium">
                                                ₹{Number(b.totalAmountInr).toLocaleString()}
                                            </div>
                                            {b.currency && b.currency !== "INR" && (
                                                <div className="text-xs text-muted-foreground">
                                                    {b.currency} {Number(b.totalAmountLocal).toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-xs text-muted-foreground">
                                            {b.paymentMethod ? b.paymentMethod.replace(/_/g, " ") : "—"}
                                        </td>
                                        <td className="px-3 py-3">
                                            <select
                                                value={b.status}
                                                onChange={(e) =>
                                                    updateStatus.mutate({
                                                        id: b.id,
                                                        status: e.target.value as BookingStatus,
                                                    })
                                                }
                                                disabled={updateStatus.isPending}
                                                className={cn(
                                                    "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                                                    STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-700"
                                                )}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-3">
                                            <select
                                                value={b.paymentStatus ?? "UNPAID"}
                                                onChange={(e) =>
                                                    updatePayment.mutate({
                                                        id: b.id,
                                                        paymentStatus: e.target.value as PaymentStatus,
                                                    })
                                                }
                                                disabled={updatePayment.isPending}
                                                className={cn(
                                                    "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                                                    PAYMENT_STYLES[b.paymentStatus ?? "UNPAID"]
                                                )}
                                            >
                                                {PAYMENT_STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-3 text-right whitespace-nowrap">
                                            <Link
                                                to={`/admin/bookings/${b.id}`}
                                                className="inline-flex items-center text-primary text-xs hover:underline mr-3"
                                            >
                                                Details
                                                <ExternalLink className="w-3 h-3 ml-0.5" />
                                            </Link>
                                            {b.status !== "CANCELLED" && (
                                                <button
                                                    onClick={() =>
                                                        setCancelTarget({ id: b.id, name: b.name })
                                                    }
                                                    className="text-red-500 hover:underline text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {list.data.totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
                                <span className="text-muted-foreground">
                                    Page {page + 1} of {list.data.totalPages} · {list.data.totalElements} total
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-3 py-1 rounded border border-border disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={page + 1 >= list.data.totalPages}
                                        className="px-3 py-1 rounded border border-border disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">No bookings match.</div>
                )}
            </div>

            {/* Cancel modal */}
            {cancelTarget && (
                <>
                    <div
                        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                        onClick={() => setCancelTarget(null)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Cancel booking #{cancelTarget.id}?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {cancelTarget.name} will receive a cancellation email immediately.
                                    </p>
                                </div>
                            </div>

                            <label className="text-sm font-medium block mb-1">Reason (optional)</label>
                            <Textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                placeholder="e.g. Customer requested cancellation, payment failed, dates unavailable…"
                                className="mb-4"
                            />

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setCancelTarget(null)}>
                                    Keep Booking
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        cancelMut.mutate({
                                            id: cancelTarget.id,
                                            reason: cancelReason.trim(),
                                        })
                                    }
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
