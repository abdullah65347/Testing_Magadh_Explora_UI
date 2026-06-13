import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Mail, Phone, Clock, Send, ChevronDown } from "lucide-react";
import { abandonedLeadService } from "@/api/services/abandonedLeadService";
import type { LeadStatus } from "@/api/services/contactService";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ui/confirm-dialog";

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "CONVERTED", "CLOSED", "CANCELLED"];

const STATUS_STYLES: Record<LeadStatus, string> = {
    NEW:       "bg-blue-100 text-blue-700",
    CONTACTED: "bg-amber-100 text-amber-700",
    CONVERTED: "bg-green-100 text-green-700",
    CLOSED:    "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const SOURCE_LABEL: Record<string, string> = {
    "quote-modal": "Quote Modal",
    "book-now-modal": "Book Now",
    "package-detail-quote": "Package Quote",
    "contact-page": "Contact Page",
};

function prettyFormState(json?: string): string {
    if (!json) return "";
    try {
        const obj = JSON.parse(json);
        return Object.entries(obj)
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
            .join(" · ");
    } catch {
        return json;
    }
}

function relativeTime(iso?: string): string {
    if (!iso) return "—";
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    if (diff < 0) {
        // Future (e.g. nextTouchAt)
        const future = -diff;
        const m = Math.round(future / 60_000);
        if (m < 60) return `in ${m}m`;
        const h = Math.round(future / 3_600_000);
        if (h < 48) return `in ${h}h`;
        return `in ${Math.round(future / 86_400_000)}d`;
    }
    const s = Math.round(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.round(diff / 60_000);
    if (m < 60) return `${m}m ago`;
    const h = Math.round(diff / 3_600_000);
    if (h < 48) return `${h}h ago`;
    return `${Math.round(diff / 86_400_000)}d ago`;
}

export default function AbandonedList() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const [page, setPage] = useState(0);
    const size = 20;

    const list = useQuery({
        queryKey: ["admin", "abandoned", page, size],
        queryFn: () => abandonedLeadService.adminList(page, size),
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
            abandonedLeadService.updateStatus(id, status),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["admin", "abandoned"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const remove = useMutation({
        mutationFn: (id: number) => abandonedLeadService.remove(id),
        onSuccess: () => {
            toast.success("Lead deleted");
            qc.invalidateQueries({ queryKey: ["admin", "abandoned"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const sendTouch = useMutation({
        mutationFn: ({ id, touch }: { id: number; touch?: 1 | 2 | 3 }) =>
            abandonedLeadService.sendTouch(id, touch),
        onSuccess: () => {
            toast.success("Reminder email queued");
            qc.invalidateQueries({ queryKey: ["admin", "abandoned"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Send failed"),
    });

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {list.isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading…</div>
            ) : list.isError ? (
                <div className="p-8 text-center text-red-500">Failed to load abandoned leads.</div>
            ) : list.data && list.data.content.length > 0 ? (
                <>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">When</th>
                                <th className="px-4 py-3 font-medium">Lead</th>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium">Form context</th>
                                <th className="px-4 py-3 font-medium">Touches</th>
                                <th className="px-4 py-3 font-medium">Last sent</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data.content.map((l) => (
                                <tr key={l.id} className="border-t border-border align-top">
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(l.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {l.name && (
                                            <div className="font-medium">{l.name}</div>
                                        )}
                                        <a
                                            href={`mailto:${l.email}`}
                                            className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                                        >
                                            <Mail className="w-3 h-3" />
                                            {l.email}
                                        </a>
                                        {l.mobile && (
                                            <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                                                <Phone className="w-3 h-3" />
                                                <a href={`tel:${l.mobile}`} className="hover:underline">
                                                    {l.mobile}
                                                </a>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="inline-flex px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {SOURCE_LABEL[l.source] ?? l.source}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-md">
                                        {prettyFormState(l.formState) || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <div className="inline-flex items-center gap-1.5">
                                            <span className="font-mono font-medium text-foreground">
                                                {l.attempts}<span className="text-muted-foreground">/3</span>
                                            </span>
                                            <span className="inline-flex gap-0.5">
                                                {[1, 2, 3].map((n) => (
                                                    <span
                                                        key={n}
                                                        className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            l.attempts >= n ? "bg-primary" : "bg-muted-foreground/30"
                                                        )}
                                                    />
                                                ))}
                                            </span>
                                        </div>
                                        {l.nextTouchAt && l.attempts < 3 && l.status === "NEW" && (
                                            <div
                                                className="text-[10px] text-muted-foreground mt-0.5"
                                                title={new Date(l.nextTouchAt).toLocaleString()}
                                            >
                                                next {relativeTime(l.nextTouchAt)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                        <div
                                            title={l.lastTouchedAt ? new Date(l.lastTouchedAt).toLocaleString() : ""}
                                        >
                                            {l.lastTouchedAt ? relativeTime(l.lastTouchedAt) : "—"}
                                        </div>
                                        {l.lastTouchChannel && (
                                            <div className="text-[10px] text-muted-foreground/70">
                                                via {l.lastTouchChannel}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={l.status}
                                            onChange={(e) =>
                                                updateStatus.mutate({
                                                    id: l.id,
                                                    status: e.target.value as LeadStatus,
                                                })
                                            }
                                            disabled={updateStatus.isPending}
                                            className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                                                STATUS_STYLES[l.status as LeadStatus] ?? "bg-gray-100 text-gray-700"
                                            )}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {(() => {
                                            const canSend = !!l.email
                                                && l.status !== "CONVERTED"
                                                && l.status !== "CANCELLED";
                                            const nextTouch = Math.min(l.attempts + 1, 3) as 1 | 2 | 3;
                                            return (
                                                <div className="inline-flex items-center gap-2">
                                                    {canSend && (
                                                        <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-border">
                                                            <button
                                                                onClick={() => sendTouch.mutate({ id: l.id })}
                                                                disabled={sendTouch.isPending}
                                                                title={`Send touch ${nextTouch}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                Send touch {nextTouch}
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    disabled={sendTouch.isPending}
                                                                    className="px-1.5 border-l border-primary-foreground/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                                                    aria-label="Pick a specific touch"
                                                                >
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-56">
                                                                    <DropdownMenuLabel>Send specific touch</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {([1, 2, 3] as const).map((n) => {
                                                                        const labels = {
                                                                            1: { title: "Touch 1", sub: "Welcome reminder" },
                                                                            2: { title: "Touch 2", sub: "Reassure & reviews" },
                                                                            3: { title: "Touch 3", sub: "Urgency + 8% off" },
                                                                        } as const;
                                                                        return (
                                                                            <DropdownMenuItem
                                                                                key={n}
                                                                                onSelect={() => sendTouch.mutate({ id: l.id, touch: n })}
                                                                                className="flex items-start gap-2 cursor-pointer"
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <span className="font-medium">{labels[n].title}</span>
                                                                                        {l.attempts >= n && (
                                                                                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">sent</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-[11px] text-muted-foreground">{labels[n].sub}</div>
                                                                                </div>
                                                                            </DropdownMenuItem>
                                                                        );
                                                                    })}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            const ok = await confirm({
                                                                title: "Delete abandoned lead?",
                                                                description: `Lead from ${l.email} will be permanently removed.`,
                                                                confirmText: "Delete",
                                                                destructive: true,
                                                            });
                                                            if (ok) remove.mutate(l.id);
                                                        }}
                                                        title="Delete lead"
                                                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })()}
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
                <div className="p-12 text-center text-muted-foreground">
                    No abandoned leads yet — visitors are either submitting or not entering valid emails.
                </div>
            )}
        </div>
    );
}
