import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Send, AlertCircle, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService, type FunnelFilters } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";

interface Props { embedded?: boolean }

export default function AdminFunnel({ embedded = false }: Props) {
    const [filters, setFilters] = useState<FunnelFilters>({});

    const q = useQuery({
        queryKey: ["analytics", "funnel-v2", filters],
        queryFn: () => analyticsService.funnelV2(filters),
    });

    const data = q.data;
    const stages = data?.stages ?? [];
    const top = stages.find((s) => s.id === "visit")?.count ?? 0;
    const maxCount = Math.max(top, ...stages.map((s) => s.count ?? 0));

    const setFilter = (key: keyof FunnelFilters, value: string) => {
        setFilters((f) => ({ ...f, [key]: value || undefined }));
    };

    const clearFilters = () => setFilters({});
    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div className="space-y-5">
            {!embedded && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Conversion Funnel</h1>
                        <p className="text-sm text-muted-foreground">
                            Visitor journey from first visit to confirmed booking.
                        </p>
                    </div>
                </div>
            )}

            {/* Filter bar */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Filters</p>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-primary hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="text-xs text-muted-foreground">From</label>
                        <Input
                            type="date"
                            value={filters.from ?? ""}
                            onChange={(e) => setFilter("from", e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">To</label>
                        <Input
                            type="date"
                            value={filters.to ?? ""}
                            onChange={(e) => setFilter("to", e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Country (ISO code)</label>
                        <Input
                            placeholder="e.g. IN, US, JP"
                            value={filters.country ?? ""}
                            onChange={(e) => setFilter("country", e.target.value.toUpperCase())}
                            className="h-9 uppercase"
                            maxLength={2}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Source (UTM)</label>
                        <Input
                            placeholder="e.g. google, facebook"
                            value={filters.source ?? ""}
                            onChange={(e) => setFilter("source", e.target.value.toLowerCase())}
                            className="h-9"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Device</label>
                        <select
                            value={filters.device ?? ""}
                            onChange={(e) => setFilter("device", e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">Any</option>
                            <option value="desktop">Desktop</option>
                            <option value="mobile">Mobile</option>
                            <option value="tablet">Tablet</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Funnel stages */}
            <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    7-Stage Funnel
                </h3>

                {q.isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
                ) : top === 0 && stages.every((s) => (s.count ?? 0) === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                            No funnel data for the selected filters yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stages.map((s, i) => {
                            const value = s.count ?? 0;
                            const width = maxCount === 0 ? 0 : Math.max(4, (value / maxCount) * 100);
                            const prev = i > 0 ? stages[i - 1].count : null;
                            const stepConv = prev && prev > 0 && s.count != null
                                ? ((s.count / prev) * 100).toFixed(1)
                                : null;
                            return (
                                <div key={s.id}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-5">{i + 1}.</span>
                                            <span className="font-medium">{s.label}</span>
                                            {!s.instrumented && (
                                                <span className="text-[10px] uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                                    pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {stepConv && s.instrumented && (
                                                <span className="text-xs text-muted-foreground">
                                                    {stepConv}% from prev
                                                </span>
                                            )}
                                            <span className="tabular-nums font-semibold">
                                                {s.instrumented ? value.toLocaleString() : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-7 rounded-md bg-muted overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all",
                                                s.instrumented ? "bg-primary" : "bg-muted-foreground/20"
                                            )}
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {top > 0 && (
                    <div className="grid sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-border">
                        <SummaryStat
                            label="Visit → Form Submit"
                            value={pct(stages.find((s) => s.id === "formSubmit")?.count, top)}
                        />
                        <SummaryStat
                            label="Visit → Booking"
                            value={pct(stages.find((s) => s.id === "booking")?.count, top)}
                        />
                        <SummaryStat
                            icon={<MessageCircle className="w-3.5 h-3.5" />}
                            label="WhatsApp Clicks"
                            value={data?.whatsappClicks?.toLocaleString() ?? "0"}
                        />
                    </div>
                )}
            </div>

            <div className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>
                    Stages 2 (Engagement — 50% scroll or 30s+) and 6 (Quote Reviewed — quote
                    link opened) are not yet instrumented. They'll populate after the next
                    tracking update. Stage 7 (Booking) is filtered only by date — the
                    bookings table doesn't yet carry visitor attribution.
                </p>
            </div>
        </div>
    );
}

function pct(value: number | null | undefined, base: number) {
    if (!value || base === 0) return "0.0%";
    return `${((value / base) * 100).toFixed(1)}%`;
}

function SummaryStat({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="bg-muted/40 rounded-md p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                {icon}
                {label}
            </p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
        </div>
    );
}
