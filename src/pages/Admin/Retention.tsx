import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Users2, Calendar, GitBranch, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

interface Props { embedded?: boolean }

function fmtInr(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString()}`;
}

function heatColor(pct: number): string {
    if (pct === 0) return "bg-muted text-muted-foreground";
    if (pct < 10) return "bg-rose-50 text-rose-700";
    if (pct < 25) return "bg-amber-50 text-amber-700";
    if (pct < 50) return "bg-lime-100 text-lime-800";
    if (pct < 75) return "bg-green-200 text-green-900";
    return "bg-emerald-500 text-white";
}

export default function AdminRetention({ embedded = false }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const params = { from: from || undefined, to: to || undefined };

    const cohortQ = useQuery({
        queryKey: ["analytics", "retention", "cohort"],
        queryFn: () => analyticsService.cohort(6),
    });
    const ltvQ = useQuery({
        queryKey: ["analytics", "retention", "ltv"],
        queryFn: () => analyticsService.ltv(10),
    });
    const seasonQ = useQuery({
        queryKey: ["analytics", "retention", "season"],
        queryFn: () => analyticsService.seasonality(12),
    });
    const attrQ = useQuery({
        queryKey: ["analytics", "retention", "attr", params],
        queryFn: () => analyticsService.attribution(params),
    });

    const cohort = cohortQ.data;
    const ltv = ltvQ.data;
    const season = seasonQ.data ?? [];
    const attr = attrQ.data;
    const horizon = cohort?.horizonMonths ?? 6;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Retention</h1>
                        <p className="text-sm text-muted-foreground">
                            Cohort retention, customer LTV and multi-touch attribution.
                        </p>
                    </div>
                )}
                <div className={cn("flex items-center gap-2 flex-wrap", embedded && "ml-auto")}>
                    <label className="text-xs text-muted-foreground">Attribution from</label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-40" />
                    <label className="text-xs text-muted-foreground">to</label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-40" />
                    {(from || to) && (
                        <button
                            onClick={() => { setFrom(""); setTo(""); }}
                            className="text-xs text-primary hover:underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* LTV summary cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={<Users2 className="w-5 h-5" />}
                    label="Total Customers"
                    value={(ltv?.totalCustomers ?? 0).toLocaleString()}
                    color="indigo"
                />
                <SummaryCard
                    icon={<GitBranch className="w-5 h-5" />}
                    label="Repeat Customers"
                    value={`${ltv?.repeatCustomers ?? 0} (${ltv?.repeatRatePct ?? 0}%)`}
                    color="primary"
                />
                <SummaryCard
                    icon={<Crown className="w-5 h-5" />}
                    label="Avg LTV (paid)"
                    value={fmtInr(ltv?.avgLtvInr)}
                    color="green"
                />
                <SummaryCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Total Lifetime Revenue"
                    value={fmtInr(ltv?.totalRevenueInr)}
                    color="amber"
                />
            </div>

            {/* Cohort heatmap */}
            <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold mb-3">Monthly Booking Cohorts</h3>
                {cohortQ.isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                ) : !cohort || cohort.cohorts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No cohort data yet.</p>
                ) : (
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-xs">
                            <thead className="text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-2 py-1.5">Cohort</th>
                                    <th className="text-right font-medium py-1.5">Size</th>
                                    {Array.from({ length: horizon }, (_, i) => (
                                        <th key={i} className="text-center font-medium py-1.5 px-1">M+{i + 1}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cohort.cohorts.map((c) => (
                                    <tr key={c.month} className="border-t border-border/50">
                                        <td className="pl-2 py-1.5 font-medium">{c.month}</td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{c.size}</td>
                                        {c.retention.map((r) => (
                                            <td key={r.offset} className="px-0.5 py-1">
                                                <div
                                                    className={cn(
                                                        "rounded-sm py-1.5 text-center tabular-nums font-medium",
                                                        heatColor(Number(r.pct))
                                                    )}
                                                    title={`${r.count} of ${c.size}`}
                                                >
                                                    {r.pct > 0 ? `${r.pct}%` : "—"}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-3">
                    Each row is the month a customer made their first booking. Cells show the % who booked again N months later.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Seasonality */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3">Booking Seasonality</h3>
                    {seasonQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : season.every((m) => m.bookings === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={season}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="month"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    tickFormatter={(m: string) => m.slice(0, 7).slice(5)}
                                />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                                <Tooltip
                                    formatter={(v: number, k: string) =>
                                        k === "revenueInr" ? [fmtInr(v), "Revenue"] : [v, "Bookings"]
                                    }
                                />
                                <Bar dataKey="bookings" fill="#c97b3a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top customers */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-600" />
                            Top Customers by LTV
                        </h3>
                        <ExportCsvButton
                            filename="top-customers-ltv"
                            rows={ltv?.topCustomers ?? []}
                            columns={[
                                { header: "Name", value: (r) => r.name },
                                { header: "Email", value: (r) => r.email },
                                { header: "Bookings", value: (r) => r.bookings },
                                { header: "Lifetime Revenue (INR)", value: (r) => r.revenueInr },
                            ]}
                        />
                    </div>
                    {ltvQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : !ltv || ltv.topCustomers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No paid bookings yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Customer</th>
                                    <th className="text-right font-medium py-1.5">Bookings</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Lifetime ₹</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ltv.topCustomers.map((c) => (
                                    <tr key={c.email} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 min-w-0">
                                            <div className="truncate font-medium">{c.name}</div>
                                            <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                                        </td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{c.bookings}</td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{fmtInr(c.revenueInr)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Multi-touch attribution */}
            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-semibold">Multi-Touch Attribution (PAID bookings)</h3>
                    <div className="text-xs text-muted-foreground">
                        {attr ? (
                            <>
                                {attr.attributedBookings} attributed · {attr.unattributedBookings} unattributed ·{" "}
                                Total {fmtInr(attr.totalRevenueInr)}
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <AttributionTable title="First Touch" rows={attr?.firstTouch ?? []} loading={attrQ.isLoading} />
                    <AttributionTable title="Last Touch" rows={attr?.lastTouch ?? []} loading={attrQ.isLoading} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                    Attribution requires the customer's email to match a tracked form_submit event. Bookings whose
                    customer never filled out a form on this site (e.g., walk-ins or pre-launch leads) appear as "unattributed".
                </p>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    color = "primary",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: "primary" | "green" | "amber" | "indigo";
}) {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        indigo: "bg-indigo-100 text-indigo-700",
    } as const;
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <span className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", colorMap[color])}>
                {icon}
            </span>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
    );
}

function AttributionTable({
    title,
    rows,
    loading,
}: {
    title: string;
    rows: Array<{ source: string; bookings: number; revenueInr: number }>;
    loading: boolean;
}) {
    const total = rows.reduce((s, r) => s + r.bookings, 0);
    return (
        <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
            {loading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data.</p>
            ) : (
                <ul className="space-y-2">
                    {rows.map((r) => {
                        const pct = total === 0 ? 0 : (r.bookings / total) * 100;
                        return (
                            <li key={r.source}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="truncate font-medium">{r.source}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {r.bookings} · {fmtInr(r.revenueInr)}
                                    </span>
                                </div>
                                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
