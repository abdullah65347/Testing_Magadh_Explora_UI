import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Globe2, Radio } from "lucide-react";
import { analyticsService } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";

type Range = 30 | 90 | 365;

const SOURCE_LABEL: Record<string, string> = {
    direct: "Direct",
    google: "Google Ads",
    facebook: "Meta Ads",
    instagram: "Instagram",
    youtube: "YouTube",
    linkedin: "LinkedIn",
};

function prettySource(s: string) {
    const k = s.toLowerCase();
    return SOURCE_LABEL[k] ?? s;
}

export default function DashboardAnalyticsRow() {
    const [range, setRange] = useState<Range>(30);

    const seriesQ = useQuery({
        queryKey: ["analytics", "visitors-series", range],
        queryFn: () => analyticsService.visitorsSeries(range),
        refetchInterval: 60_000,
    });
    const sourcesQ = useQuery({
        queryKey: ["analytics", "top-sources"],
        queryFn: () => analyticsService.topSources(5),
        refetchInterval: 60_000,
    });
    const countriesQ = useQuery({
        queryKey: ["analytics", "top-countries"],
        queryFn: () => analyticsService.topCountries(5),
        refetchInterval: 60_000,
    });

    const series = seriesQ.data ?? [];
    const sources = sourcesQ.data ?? [];
    const countries = countriesQ.data ?? [];
    const seriesEmpty = series.length === 0 || series.every((p) => p.visitors === 0);
    const sourcesTotal = sources.reduce((s, r) => s + r.visitors, 0);
    const countriesTotal = countries.reduce((s, r) => s + r.visitors, 0);

    return (
        <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="font-semibold">Visitors Trend</h3>
                    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                        {([30, 90, 365] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={cn(
                                    "px-3 py-1 rounded text-xs font-medium",
                                    range === r
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {r}d
                            </button>
                        ))}
                    </div>
                </div>
                {seriesEmpty ? (
                    <p className="text-sm text-muted-foreground text-center py-16">
                        No visitor data in this range yet.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={series}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                                tickFormatter={(d: string) => {
                                    const parts = d.split("-");
                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                                }}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                            <Tooltip formatter={(v: number) => [v, "Visitors"]} />
                            <Line
                                type="monotone"
                                dataKey="visitors"
                                stroke="#c97b3a"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-primary" />
                        Top Sources Today
                    </h3>
                    {sourcesTotal === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No traffic yet today.</p>
                    ) : (
                        <ul className="space-y-2">
                            {sources.map((s) => {
                                const pct = sourcesTotal === 0 ? 0 : (s.visitors / sourcesTotal) * 100;
                                return (
                                    <li key={s.source}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate">{prettySource(s.source)}</span>
                                            <span className="text-muted-foreground tabular-nums">{s.visitors}</span>
                                        </div>
                                        <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-primary" />
                        Today by Country
                    </h3>
                    {countriesTotal === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No visitors yet today.</p>
                    ) : (
                        <ul className="space-y-2">
                            {countries.map((c) => (
                                <li key={c.countryCode + c.country} className="flex items-center gap-2 text-sm">
                                    <span
                                        className={cn(
                                            "fi rounded-sm shadow-sm flex-shrink-0",
                                            c.countryCode && c.countryCode !== "xx"
                                                ? `fi-${c.countryCode}`
                                                : ""
                                        )}
                                        style={{ width: 18, height: 13 }}
                                        aria-hidden
                                    />
                                    <span className="flex-1 truncate">{c.country}</span>
                                    <span className="text-muted-foreground tabular-nums">{c.visitors}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
