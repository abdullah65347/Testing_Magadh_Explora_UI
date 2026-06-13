import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Flame, Mail } from "lucide-react";
import { analyticsService, type LeadTier } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

const TIER_STYLE: Record<LeadTier, string> = {
    HOT: "bg-rose-100 text-rose-700 border-rose-200",
    WARM: "bg-amber-100 text-amber-700 border-amber-200",
    COLD: "bg-muted text-muted-foreground border-border",
};

const TYPE_LABEL: Record<string, string> = {
    quote: "Quote",
    contact: "Contact",
    booking: "Booking",
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

export default function HotLeadsWidget() {
    const q = useQuery({
        queryKey: ["analytics", "hot-leads"],
        queryFn: () => analyticsService.hotLeads(8),
        refetchInterval: 60_000,
    });

    const rows = q.data ?? [];

    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Hot Leads
                </h3>
                <ExportCsvButton
                    filename="hot-leads"
                    rows={rows}
                    columns={[
                        { header: "Name", value: (r) => r.name },
                        { header: "Email", value: (r) => r.email },
                        { header: "Type", value: (r) => r.type },
                        { header: "Country", value: (r) => r.country ?? "" },
                        { header: "Score", value: (r) => r.score },
                        { header: "Tier", value: (r) => r.tier },
                        { header: "Reason", value: (r) => r.reason },
                        { header: "Created", value: (r) => r.createdAt },
                    ]}
                />
            </div>
            {q.isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                    No leads in the last 30 days.
                </p>
            ) : (
                <ul className="space-y-2.5">
                    {rows.map((r) => (
                        <li key={`${r.type}-${r.id}`} className="flex items-start gap-3">
                            <div
                                className={cn(
                                    "shrink-0 w-10 h-10 rounded-md border flex items-center justify-center text-sm font-bold tabular-nums",
                                    TIER_STYLE[r.tier]
                                )}
                                title={r.tier}
                            >
                                {r.score}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                    <Link to={r.href} className="font-medium truncate hover:underline">
                                        {r.name}
                                    </Link>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {TYPE_LABEL[r.type] ?? r.type}
                                    </span>
                                    {r.country && (
                                        <span className="text-xs text-muted-foreground">· {r.country}</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3 inline" />
                                    {r.email}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate" title={r.reason}>
                                    {r.reason}
                                </p>
                            </div>
                            <span className="text-[11px] text-muted-foreground shrink-0">
                                {timeAgo(r.createdAt)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
