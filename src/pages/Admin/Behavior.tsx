import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, FileX, ExternalLink, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService } from "@/api/services/analyticsService";
import { CLARITY_ID } from "@/config/env";
import { cn } from "@/lib/utils";

interface Props { embedded?: boolean }

const FORM_LABEL: Record<string, string> = {
    quote: "Quote",
    book_now: "Book Now",
    contact: "Contact",
};

function fmtPct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Number(v).toFixed(1)}%`;
}

export default function AdminBehavior({ embedded = false }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const params = { from: from || undefined, to: to || undefined };

    const pagesQ = useQuery({
        queryKey: ["analytics", "behavior", "pages", params],
        queryFn: () => analyticsService.behaviorPages({ ...params, limit: 10 }),
    });
    const waQ = useQuery({
        queryKey: ["analytics", "behavior", "wa", params],
        queryFn: () => analyticsService.behaviorWhatsapp({ ...params, limit: 8 }),
    });
    const abandonQ = useQuery({
        queryKey: ["analytics", "behavior", "abandon", params],
        queryFn: () => analyticsService.behaviorFormAbandonment(params),
    });

    const topPaths = pagesQ.data?.topPaths ?? [];
    const landing = pagesQ.data?.topLandingPaths ?? [];
    const wa = waQ.data;
    const abandon = abandonQ.data ?? [];
    const maxViews = Math.max(1, ...topPaths.map((r) => r.views));
    const maxLanding = Math.max(1, ...landing.map((r) => r.sessions));
    const maxWA = Math.max(1, ...(wa?.byCountry.map((r) => r.clicks) ?? [1]));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Behavior</h1>
                        <p className="text-sm text-muted-foreground">
                            How visitors navigate, click and drop off.
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

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Top viewed pages */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Top Pages
                    </h3>
                    {pagesQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : topPaths.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No pageviews in range.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Path</th>
                                    <th className="text-right font-medium py-1.5">Views</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPaths.map((r) => (
                                    <tr key={r.path} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 font-mono text-xs truncate max-w-[220px]">{r.path || "/"}</td>
                                        <td className="text-right tabular-nums py-1.5">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-muted-foreground">{r.views}</span>
                                                <span className="inline-block w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <span
                                                        className="block h-full bg-primary"
                                                        style={{ width: `${(r.views / maxViews) * 100}%` }}
                                                    />
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{r.uniqueVisitors}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Top entry / landing pages */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Top Entry Pages
                    </h3>
                    {pagesQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : landing.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No sessions in range.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Path</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Sessions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {landing.map((r) => (
                                    <tr key={r.path} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5 font-mono text-xs truncate max-w-[260px]">{r.path || "/"}</td>
                                        <td className="text-right tabular-nums pr-1 py-1.5">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="text-muted-foreground">{r.sessions}</span>
                                                <span className="inline-block w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <span
                                                        className="block h-full bg-amber-500"
                                                        style={{ width: `${(r.sessions / maxLanding) * 100}%` }}
                                                    />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* WhatsApp clicks */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        WhatsApp Clicks
                    </h3>
                    {waQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : (
                        <>
                            <p className="text-3xl font-bold mb-3">{(wa?.total ?? 0).toLocaleString()}</p>
                            {wa && wa.byCountry.length > 0 ? (
                                <ul className="space-y-2">
                                    {wa.byCountry.map((r) => {
                                        const pct = (r.clicks / maxWA) * 100;
                                        return (
                                            <li key={r.countryCode + r.country}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className={cn(
                                                                "fi rounded-sm shadow-sm",
                                                                r.countryCode && r.countryCode !== "xx" ? `fi-${r.countryCode}` : ""
                                                            )}
                                                            style={{ width: 16, height: 12 }}
                                                            aria-hidden
                                                        />
                                                        <span className="truncate">{r.country}</span>
                                                    </span>
                                                    <span className="text-muted-foreground tabular-nums">{r.clicks}</span>
                                                </div>
                                                <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-xs text-muted-foreground">No clicks by country yet.</p>
                            )}
                        </>
                    )}
                </div>

                {/* Form abandonment */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileX className="w-4 h-4 text-rose-600" />
                        Form Abandonment
                    </h3>
                    {abandonQ.isLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
                    ) : abandon.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No form activity in range.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium pl-1 py-1.5">Form</th>
                                    <th className="text-right font-medium py-1.5">Started</th>
                                    <th className="text-right font-medium py-1.5">Submitted</th>
                                    <th className="text-right font-medium pr-1 py-1.5">Aband %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {abandon.map((r) => (
                                    <tr key={r.form} className="border-t border-border/50">
                                        <td className="pl-1 py-1.5">{FORM_LABEL[r.form] ?? r.form}</td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.started}</td>
                                        <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.submitted}</td>
                                        <td className="text-right tabular-nums pr-1 py-1.5 font-medium">{fmtPct(r.abandonmentPct)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Microsoft Clarity */}
            <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    Heatmaps &amp; Session Recordings
                </h3>
                {CLARITY_ID ? (
                    <p className="text-sm text-muted-foreground">
                        Microsoft Clarity is connected (project <code className="text-xs">{CLARITY_ID}</code>).
                        Heatmaps, scroll maps and session recordings live in the Clarity dashboard.{" "}
                        <a
                            href={`https://clarity.microsoft.com/projects/view/${CLARITY_ID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                            Open Clarity <ExternalLink className="w-3 h-3" />
                        </a>
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Set <code className="text-xs">VITE_CLARITY_ID</code> in your <code className="text-xs">.env</code>{" "}
                        to enable Microsoft Clarity heatmaps and session recordings. The loader is already wired and gates
                        behind cookie consent.
                    </p>
                )}
            </div>
        </div>
    );
}
