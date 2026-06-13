import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import {
    DollarSign,
    Briefcase,
    Send,
    TrendingUp,
    Wallet,
    AlertCircle,
    CreditCard,
    Clock,
    XCircle,
    Trophy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

const PALETTE = ["#c97b3a", "#d4a017", "#6b2737", "#175e3b", "#4f46e5", "#0891b2", "#9333ea", "#dc2626"];

function fmtInr(n: number | string | undefined): string {
    const num = Number(n ?? 0);
    if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)}Cr`;
    if (num >= 100_000) return `₹${(num / 100_000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString()}`;
}

interface Props { embedded?: boolean }

export default function Analytics({ embedded = false }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

    const range = { from: from || undefined, to: to || undefined };

    const summaryQ = useQuery({
        queryKey: ["analytics", "summary", range],
        queryFn: () => analyticsService.summary(range),
    });
    const seriesQ = useQuery({
        queryKey: ["analytics", "series", range, groupBy],
        queryFn: () => analyticsService.revenueSeries({ ...range, groupBy }),
    });
    const byPkgQ = useQuery({
        queryKey: ["analytics", "byPackage", range],
        queryFn: () => analyticsService.byPackage({ ...range, limit: 8 }),
    });
    const distQ = useQuery({
        queryKey: ["analytics", "dist", range],
        queryFn: () => analyticsService.statusDistribution(range),
    });
    const funnelQ = useQuery({
        queryKey: ["analytics", "funnel", range],
        queryFn: () => analyticsService.funnel(range),
    });
    const extrasQ = useQuery({
        queryKey: ["analytics", "sales-extras", range],
        queryFn: () => analyticsService.salesExtras(range),
    });

    const summary = summaryQ.data;
    const series = seriesQ.data ?? [];
    const byPkg = byPkgQ.data ?? [];
    const distByStatus = distQ.data?.byStatus ?? {};
    const distByPayment = distQ.data?.byPayment ?? {};
    const funnel = funnelQ.data;

    const statusPie = Object.entries(distByStatus).map(([k, v]) => ({ name: k, value: v }));
    const paymentPie = Object.entries(distByPayment).map(([k, v]) => ({ name: k, value: v }));

    const funnelBars = funnel
        ? [
              { stage: "Contacts", count: funnel.contacts },
              { stage: "Quotes", count: funnel.quotes },
              { stage: "Bookings", count: funnel.bookings },
              { stage: "Paid", count: funnel.paid },
          ]
        : [];

    const isError = summaryQ.isError || seriesQ.isError || byPkgQ.isError || distQ.isError || funnelQ.isError;

    const extras = extrasQ.data;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Sales</h1>
                        <p className="text-sm text-muted-foreground">
                            Sales performance, bookings funnel, and revenue trends.
                        </p>
                    </div>
                )}
                <div className={cn("flex items-center gap-2 flex-wrap", embedded && "ml-auto")}>
                    <label className="text-xs text-muted-foreground">From</label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-40" />
                    <label className="text-xs text-muted-foreground">To</label>
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

            {isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                        Some analytics couldn't load. Make sure the backend has the latest analytics endpoints.
                    </p>
                </div>
            )}

            {/* KPI cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Kpi
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Paid Revenue"
                    value={fmtInr(summary?.totalRevenueInr)}
                    sublabel={`${summary?.paid ?? 0} paid bookings`}
                    color="green"
                />
                <Kpi
                    icon={<Wallet className="w-5 h-5" />}
                    label="Pipeline"
                    value={fmtInr(summary?.pipelineInr)}
                    sublabel="Confirmed but unpaid"
                    color="amber"
                />
                <Kpi
                    icon={<Briefcase className="w-5 h-5" />}
                    label="Total Bookings"
                    value={summary?.totalBookings ?? 0}
                    sublabel={`${summary?.confirmed ?? 0} confirmed · ${summary?.cancelled ?? 0} cancelled`}
                    color="primary"
                />
                <Kpi
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Avg Booking Value"
                    value={fmtInr(summary?.avgBookingValueInr)}
                    sublabel={`Conv. ${summary?.conversionRate ?? 0}%`}
                    color="indigo"
                />
                <Kpi
                    icon={<Trophy className="w-5 h-5" />}
                    label="Win Rate"
                    value={`${Number(extras?.winRate.ratePct ?? 0).toFixed(1)}%`}
                    sublabel={`${extras?.winRate.paid ?? 0} of ${extras?.winRate.total ?? 0} paid`}
                    color="green"
                />
                <Kpi
                    icon={<XCircle className="w-5 h-5" />}
                    label="Cancellation Rate"
                    value={`${Number(extras?.cancellation.ratePct ?? 0).toFixed(1)}%`}
                    sublabel={`Lost ${fmtInr(extras?.cancellation.revenueLostInr)}`}
                    color="rose"
                />
            </div>

            {/* Revenue + bookings time-series */}
            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="font-semibold">Bookings & Revenue Over Time</h3>
                    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                        {(["day", "week", "month"] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGroupBy(g)}
                                className={cn(
                                    "px-3 py-1 rounded text-xs font-medium",
                                    groupBy === g
                                        ? "bg-background text-foreground shadow-soft"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                {series.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">
                        No bookings in this range yet.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={series}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={fmtInr} />
                            <Tooltip
                                formatter={(v: any, k: any) =>
                                    k === "revenueInr" ? [fmtInr(v), "Revenue"] : [v, "Bookings"]
                                }
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#c97b3a" strokeWidth={2} dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="revenueInr" stroke="#175e3b" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Top packages */}
                <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-4">Top Packages by Revenue</h3>
                    {byPkg.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-12">
                            No paid bookings yet.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={byPkg} layout="vertical" margin={{ left: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={fmtInr} />
                                <YAxis type="category" dataKey="title" width={140} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <Tooltip formatter={(v: any) => fmtInr(v)} />
                                <Bar dataKey="revenueInr" fill="#c97b3a" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Lead funnel */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        Conversion Funnel
                    </h3>
                    {funnelBars.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={funnelBars}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6b2737" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {funnel && funnel.contacts > 0 && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            {((funnel.bookings / funnel.contacts) * 100).toFixed(1)}% of contacts become bookings
                        </p>
                    )}
                </div>
            </div>

            {/* Status distributions */}
            <div className="grid sm:grid-cols-2 gap-4">
                <DistroPie title="Booking Status" data={statusPie} />
                <DistroPie title="Payment Status" data={paymentPie} />
            </div>

            {/* Payment method mix + Lead time histogram */}
            <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment Method Mix
                        </h3>
                        <ExportCsvButton
                            filename="payment-method-mix"
                            rows={extras?.paymentMix ?? []}
                            columns={[
                                { header: "Method", value: (r) => r.method },
                                { header: "Bookings", value: (r) => r.bookings },
                                { header: "Paid Revenue (INR)", value: (r) => r.revenueInr },
                            ]}
                        />
                    </div>
                    {!extras || extras.paymentMix.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-10">No bookings in range.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Method</th>
                                    <th className="text-right font-medium py-1.5">Bookings</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Paid Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extras.paymentMix.map((r) => (
                                    <tr key={r.method} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 capitalize">{r.method.replace(/_/g, " ")}</td>
                                        <td className="text-right tabular-nums py-1.5">{r.bookings}</td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{fmtInr(Number(r.revenueInr))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {extras && extras.currencyMix.length > 1 && (
                        <div className="mt-4 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1.5">Currency mix</p>
                            <div className="flex flex-wrap gap-2">
                                {extras.currencyMix.map((c) => (
                                    <span key={c.currency} className="text-xs px-2 py-1 rounded-md bg-muted">
                                        {c.currency}: {c.bookings}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        Booking Lead Time
                    </h3>
                    {!extras || extras.leadTime.every((b) => b.count === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-10">No bookings with travel dates yet.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={extras.leadTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            {extras.leadTimeStats.avgDays != null && (
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Avg lead time: <span className="font-medium text-foreground">{Number(extras.leadTimeStats.avgDays).toFixed(1)} days</span>
                                    {" · "}{extras.leadTimeStats.samples} bookings
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Kpi({
    icon,
    label,
    value,
    sublabel,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sublabel?: string;
    color?: "primary" | "green" | "amber" | "indigo" | "rose";
}) {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        indigo: "bg-indigo-100 text-indigo-700",
        rose: "bg-rose-100 text-rose-700",
    } as const;
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
                <span className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorMap[color ?? "primary"])}>
                    {icon}
                </span>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        </div>
    );
}

function DistroPie({ title, data }: { title: string; data: { name: string; value: number }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-4">{title}</h3>
            {total === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
