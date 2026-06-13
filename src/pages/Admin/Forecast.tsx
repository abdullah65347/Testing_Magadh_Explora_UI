import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    ReferenceLine,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Briefcase,
    DollarSign,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { analyticsService, type ForecastCard, type ForecastResponse } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";

interface Props { embedded?: boolean }

type Horizon = 30 | 60 | 90;

function fmtInr(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString()}`;
}

function fmtNum(n: number | null | undefined): string {
    if (n == null) return "—";
    return Math.round(n).toLocaleString();
}

function Delta({ pct }: { pct: number | null | undefined }) {
    if (pct == null) {
        return <span className="text-xs text-muted-foreground">no prior data</span>;
    }
    const up = pct >= 0;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                up ? "text-green-600" : "text-red-600"
            )}
        >
            <Icon className="w-3 h-3" />
            {Math.abs(pct).toFixed(1)}% <span className="text-muted-foreground font-normal ml-1">vs prior period</span>
        </span>
    );
}

export default function AdminForecast({ embedded = false }: Props) {
    const [horizon, setHorizon] = useState<Horizon>(30);

    const summaryQ = useQuery({
        queryKey: ["forecast", "summary", horizon],
        queryFn: () => analyticsService.forecastSummary(horizon),
    });
    const visitorsQ = useQuery({
        queryKey: ["forecast", "visitors", horizon],
        queryFn: () => analyticsService.forecastVisitors(90, horizon),
    });
    const bookingsQ = useQuery({
        queryKey: ["forecast", "bookings", horizon],
        queryFn: () => analyticsService.forecastBookings(90, horizon),
    });
    const revenueQ = useQuery({
        queryKey: ["forecast", "revenue", horizon],
        queryFn: () => analyticsService.forecastRevenue(90, horizon),
    });

    const summary = summaryQ.data;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Forecast</h1>
                        <p className="text-sm text-muted-foreground">
                            Linear-trend projections with 95% confidence band.
                        </p>
                    </div>
                )}
                <div className={cn("flex items-center gap-1 bg-muted rounded-md p-0.5", embedded && "ml-auto")}>
                    {([30, 60, 90] as const).map((h) => (
                        <button
                            key={h}
                            onClick={() => setHorizon(h)}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-medium",
                                horizon === h
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Next {h}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary KPI cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <ProjectionCard
                    icon={<Users className="w-5 h-5" />}
                    label={`Projected Visitors · next ${horizon}d`}
                    card={summary?.visitors}
                    formatter={fmtNum}
                    color="primary"
                />
                <ProjectionCard
                    icon={<Briefcase className="w-5 h-5" />}
                    label={`Projected Bookings · next ${horizon}d`}
                    card={summary?.bookings}
                    formatter={fmtNum}
                    color="amber"
                />
                <ProjectionCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label={`Projected Revenue · next ${horizon}d`}
                    card={summary?.revenue}
                    formatter={fmtInr}
                    color="green"
                />
            </div>

            <ForecastChart title="Visitors" data={visitorsQ.data} loading={visitorsQ.isLoading} formatter={fmtNum} color="#c97b3a" />
            <ForecastChart title="Bookings" data={bookingsQ.data} loading={bookingsQ.isLoading} formatter={fmtNum} color="#6b2737" />
            <ForecastChart title="Revenue (₹)" data={revenueQ.data} loading={revenueQ.isLoading} formatter={fmtInr} color="#175e3b" />

            <div className="text-xs text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>
                    Projections use ordinary least-squares linear regression on the last 90 days of data, with a ±1.96σ
                    confidence band based on residuals. They assume the trend continues — large product changes,
                    seasonality, or marketing pushes will move actuals outside the band.
                </p>
            </div>
        </div>
    );
}

function ProjectionCard({
    icon,
    label,
    card,
    formatter,
    color = "primary",
}: {
    icon: React.ReactNode;
    label: string;
    card: ForecastCard | undefined;
    formatter: (n: number | null | undefined) => string;
    color?: "primary" | "green" | "amber";
}) {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
    } as const;
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
                <span className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorMap[color])}>
                    {icon}
                </span>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5">
                {card?.sufficient ? formatter(card.horizonTotal) : "—"}
            </p>
            <div className="mt-1">
                {card?.sufficient ? (
                    <Delta pct={card.deltaPct} />
                ) : (
                    <span className="text-xs text-amber-700">{card?.note ?? "Insufficient data"}</span>
                )}
            </div>
        </div>
    );
}

function ForecastChart({
    title,
    data,
    loading,
    formatter,
    color,
}: {
    title: string;
    data: ForecastResponse | undefined;
    loading: boolean;
    formatter: (n: number | null | undefined) => string;
    color: string;
}) {
    if (loading) {
        return (
            <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            </div>
        );
    }
    if (!data || !data.sufficient) {
        return (
            <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold mb-3">{title}</h3>
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{data?.note ?? "No data."}</span>
                </div>
            </div>
        );
    }
    const lastActual = [...data.series].reverse().find((p) => p.actual != null);
    const fitQuality = data.r2 >= 0.5 ? "good fit" : data.r2 >= 0.2 ? "moderate fit" : "weak fit";

    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h3 className="font-semibold">{title}</h3>
                <div className="text-xs text-muted-foreground">
                    R² {data.r2.toFixed(2)} · slope/day {data.slopePerDay >= 0 ? "+" : ""}
                    {data.slopePerDay.toFixed(2)} · {fitQuality}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickFormatter={(d: string) => {
                            const parts = d.split("-");
                            return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                        }}
                        minTickGap={20}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={(v: number) => formatter(v)}
                    />
                    <Tooltip
                        formatter={(v: number | null, k: string) => {
                            if (v == null) return ["—", k];
                            return [formatter(v), k];
                        }}
                        labelFormatter={(l) => `Date: ${l}`}
                    />
                    <Legend />
                    {lastActual && (
                        <ReferenceLine x={lastActual.date} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" label={{ value: "today", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    )}
                    <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill={color}
                        fillOpacity={0.08}
                        legendType="none"
                        name="upper"
                    />
                    <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="hsl(var(--background))"
                        fillOpacity={1}
                        legendType="none"
                        name="lower"
                    />
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name="Actual"
                        connectNulls={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="projected"
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={false}
                        name="Projected"
                        connectNulls={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
