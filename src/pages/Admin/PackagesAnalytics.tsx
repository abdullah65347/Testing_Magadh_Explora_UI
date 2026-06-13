import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye, TrendingUp, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

interface Props { embedded?: boolean }

function fmtPct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Number(v).toFixed(1)}%`;
}

export default function PackagesAnalytics({ embedded = false }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const params = { from: from || undefined, to: to || undefined };

    const viewsQ = useQuery({
        queryKey: ["analytics", "pkg", "views", params],
        queryFn: () => analyticsService.packageViews({ ...params, limit: 10 }),
    });
    const convQ = useQuery({
        queryKey: ["analytics", "pkg", "conversion", params],
        queryFn: () => analyticsService.packageConversion({ ...params, limit: 10 }),
    });
    const countriesQ = useQuery({
        queryKey: ["analytics", "pkg", "countries", params],
        queryFn: () => analyticsService.packageCountries({ ...params, limit: 10 }),
    });

    const views = viewsQ.data ?? [];
    const conv = convQ.data ?? [];
    const countries = countriesQ.data ?? [];
    const maxViews = Math.max(1, ...views.map((r) => r.views));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Packages</h1>
                        <p className="text-sm text-muted-foreground">
                            Which packages get the most attention and convert best.
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

            {/* Most viewed */}
            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        Most Viewed Packages
                    </h3>
                    <ExportCsvButton
                        filename="package-views"
                        rows={views}
                        columns={[
                            { header: "Package", value: (r) => r.title },
                            { header: "Slug", value: (r) => r.slug ?? "" },
                            { header: "Views", value: (r) => r.views },
                            { header: "Unique Visitors", value: (r) => r.uniqueVisitors },
                        ]}
                    />
                </div>
                {viewsQ.isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                ) : views.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        No package_view events in range. Visit a package page (and accept cookies) to populate.
                    </p>
                ) : (
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-2 py-1.5">Package</th>
                                    <th className="text-right font-medium py-1.5">Views</th>
                                    <th className="text-right font-medium pr-2 py-1.5">Unique Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {views.map((r) => (
                                    <tr key={r.packageId} className="border-t border-border/50">
                                        <td className="pl-2 py-1.5">
                                            {r.slug ? (
                                                <Link to={`/packages/${r.slug}`} target="_blank" className="hover:underline">
                                                    {r.title}
                                                </Link>
                                            ) : (
                                                r.title
                                            )}
                                        </td>
                                        <td className="text-right tabular-nums py-1.5">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-muted-foreground">{r.views}</span>
                                                <span className="inline-block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <span
                                                        className="block h-full bg-primary"
                                                        style={{ width: `${(r.views / maxViews) * 100}%` }}
                                                    />
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right tabular-nums pr-2 py-1.5 font-medium">
                                            {r.uniqueVisitors}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* View-to-enquiry */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        View-to-Enquiry Conversion
                    </h3>
                    {convQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : conv.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No data yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Package</th>
                                    <th className="text-right font-medium py-1.5">Viewers</th>
                                    <th className="text-right font-medium py-1.5">Submitters</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Conv %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conv.map((r) => (
                                    <tr key={r.packageId} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 truncate max-w-[180px]">{r.title}</td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.viewers}</td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.submitters}</td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{fmtPct(r.conversionPct)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-3">
                        Conversion is per-visitor: viewers who also submitted any form in the range.
                    </p>
                </div>

                {/* Top country per package */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        Country Preference
                    </h3>
                    {countriesQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : countries.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No data yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Package</th>
                                    <th className="text-left font-medium py-1.5">Top Country</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Viewers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {countries.map((r) => (
                                    <tr key={r.packageId + r.countryCode} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 truncate max-w-[180px]">{r.title}</td>
                                        <td className="py-1.5">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span
                                                    className={cn(
                                                        "fi rounded-sm shadow-sm",
                                                        r.countryCode && r.countryCode !== "xx" ? `fi-${r.countryCode}` : ""
                                                    )}
                                                    style={{ width: 16, height: 12 }}
                                                    aria-hidden
                                                />
                                                <span className="text-muted-foreground">{r.country}</span>
                                            </span>
                                        </td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{r.viewers}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
