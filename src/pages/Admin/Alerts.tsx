import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Info, CheckCheck, RefreshCw, Bell, AlertCircle } from "lucide-react";
import { alertService, type Alert, type AlertSeverity } from "@/api/services/alertService";
import { cn } from "@/lib/utils";

interface Props { embedded?: boolean }

const SEV_STYLE: Record<AlertSeverity, string> = {
    INFO: "text-blue-600 bg-blue-50 border-blue-100",
    WARNING: "text-amber-700 bg-amber-50 border-amber-200",
    CRITICAL: "text-rose-700 bg-rose-50 border-rose-200",
};

const SEV_ICON: Record<AlertSeverity, typeof Info> = {
    INFO: Info,
    WARNING: AlertTriangle,
    CRITICAL: AlertCircle,
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.round(diff / 60_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24);
    return `${d}d ago`;
}

export default function AdminAlerts({ embedded = false }: Props) {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);

    const q = useQuery({
        queryKey: ["alerts", page],
        queryFn: () => alertService.list(page, 20),
        refetchInterval: 60_000,
    });

    const markRead = useMutation({
        mutationFn: (id: number) => alertService.markRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["alerts"] });
            qc.invalidateQueries({ queryKey: ["alerts-unread"] });
        },
    });

    const markAllRead = useMutation({
        mutationFn: () => alertService.markAllRead(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["alerts"] });
            qc.invalidateQueries({ queryKey: ["alerts-unread"] });
        },
    });

    const scan = useMutation({
        mutationFn: () => alertService.scan(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
    });

    const data = q.data;
    const items = data?.content ?? [];
    const unread = items.filter((a) => !a.read).length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Alerts</h1>
                        <p className="text-sm text-muted-foreground">
                            Notifications from the automated scanner.
                        </p>
                    </div>
                )}
                <div className={cn("flex items-center gap-2", embedded && "ml-auto")}>
                    <button
                        onClick={() => scan.mutate()}
                        disabled={scan.isPending}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", scan.isPending && "animate-spin")} />
                        Scan now
                    </button>
                    {unread > 0 && (
                        <button
                            onClick={() => markAllRead.mutate()}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {q.isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            ) : items.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">No alerts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        The scanner runs hourly. It checks for traffic drops, hot leads and high-value bookings.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((a) => (
                        <AlertRow key={a.id} alert={a} onRead={() => markRead.mutate(a.id)} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        Page {data.number + 1} of {data.totalPages} · {data.totalElements} total
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={data.number === 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted"
                        >
                            Prev
                        </button>
                        <button
                            disabled={data.number >= data.totalPages - 1}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertRow({ alert, onRead }: { alert: Alert; onRead: () => void }) {
    const Icon = SEV_ICON[alert.severity];
    return (
        <div
            className={cn(
                "border rounded-lg p-4 flex items-start gap-3",
                alert.read ? "bg-card border-border" : SEV_STYLE[alert.severity]
            )}
        >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background/60">
                        {alert.severity}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {alert.ruleId}
                    </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed">{alert.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                    {timeAgo(alert.createdAt)}
                    {alert.emailSent && " · email sent"}
                </p>
            </div>
            {!alert.read && (
                <button
                    onClick={onRead}
                    className="text-xs px-2 py-1 rounded border border-current/30 hover:bg-background/60 flex-shrink-0"
                >
                    Mark read
                </button>
            )}
        </div>
    );
}
