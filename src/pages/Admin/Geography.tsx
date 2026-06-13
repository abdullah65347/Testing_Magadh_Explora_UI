import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe2, MapPin, Heart, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analyticsService, type GeoCityRow } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

const BUDDHIST_COUNTRIES = ["lk", "th", "jp", "mm", "vn", "kr"];
const BIHARI_DIASPORA = ["delhi", "new delhi", "mumbai", "bengaluru", "bangalore", "pune", "hyderabad", "kolkata"];

function fmtPct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Number(v).toFixed(1)}%`;
}

interface Props { embedded?: boolean }

export default function AdminGeography({ embedded = false }: Props) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [cityCountry, setCityCountry] = useState("IN");

    const params = { from: from || undefined, to: to || undefined };

    const countriesQ = useQuery({
        queryKey: ["analytics", "geo", "countries", params],
        queryFn: () => analyticsService.geoCountries({ ...params, limit: 20 }),
    });
    const citiesQ = useQuery({
        queryKey: ["analytics", "geo", "cities", params, cityCountry],
        queryFn: () => analyticsService.geoCities({ ...params, country: cityCountry, limit: 20 }),
        enabled: !!cityCountry,
    });

    const countries = countriesQ.data ?? [];
    const cities = citiesQ.data ?? [];
    const buddhistCountries = countries.filter((c) => BUDDHIST_COUNTRIES.includes(c.countryCode));
    const indiaCities = cityCountry === "IN" ? cities : [];
    const diasporaCities = indiaCities.filter((c) =>
        BIHARI_DIASPORA.includes(c.city.trim().toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Geography</h1>
                        <p className="text-sm text-muted-foreground">
                            Where your visitors are coming from and how they convert.
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
                {/* Country ranking */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-primary" />
                            Top Countries
                        </h3>
                        <ExportCsvButton
                            filename="geography-countries"
                            rows={countries}
                            columns={[
                                { header: "Country", value: (r) => r.country },
                                { header: "Code", value: (r) => r.countryCode },
                                { header: "Visitors", value: (r) => r.visitors },
                                { header: "Submits", value: (r) => r.submits },
                                { header: "Conversion %", value: (r) => r.conversionPct ?? "" },
                            ]}
                        />
                    </div>
                    <CountryTable rows={countries} loading={countriesQ.isLoading} />
                </div>

                {/* Buddhist country focus */}
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-orange-600" />
                        Buddhist Country Focus
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Sri Lanka · Thailand · Japan · Myanmar · Vietnam · Korea
                    </p>
                    <CountryTable rows={buddhistCountries} loading={countriesQ.isLoading} emptyMsg="No visitors from these countries in range." />
                </div>
            </div>

            {/* India city drill-down */}
            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        City Drill-down
                    </h3>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Country (ISO):</label>
                        <Input
                            value={cityCountry}
                            onChange={(e) => setCityCountry(e.target.value.toUpperCase())}
                            className="h-8 w-20 uppercase"
                            maxLength={2}
                        />
                        <ExportCsvButton
                            filename={`cities-${cityCountry}`}
                            rows={cities}
                            columns={[
                                { header: "City", value: (r) => r.city },
                                { header: "Visitors", value: (r) => r.visitors },
                                { header: "Submits", value: (r) => r.submits },
                                { header: "Conversion %", value: (r) => r.conversionPct ?? "" },
                            ]}
                        />
                    </div>
                </div>
                <CityTable rows={cities} loading={citiesQ.isLoading} />
            </div>

            {/* Bihari diaspora panel (only when IN) */}
            {cityCountry === "IN" && (
                <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        Bihari Diaspora Cities
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Delhi NCR · Mumbai · Bangalore · Pune · Hyderabad · Kolkata
                    </p>
                    <CityTable
                        rows={diasporaCities}
                        loading={citiesQ.isLoading}
                        emptyMsg="No traffic from diaspora hubs in range."
                    />
                </div>
            )}
        </div>
    );
}

function CountryTable({
    rows,
    loading,
    emptyMsg,
}: {
    rows: Array<{ countryCode: string; country: string; visitors: number; submits: number; conversionPct: number | null }>;
    loading: boolean;
    emptyMsg?: string;
}) {
    if (loading) return <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>;
    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-6">{emptyMsg ?? "No data yet."}</p>;
    }
    const maxV = Math.max(...rows.map((r) => r.visitors), 1);
    return (
        <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                    <tr>
                        <th className="text-left font-medium pl-2 py-1.5">Country</th>
                        <th className="text-right font-medium py-1.5">Visitors</th>
                        <th className="text-right font-medium py-1.5">Submits</th>
                        <th className="text-right font-medium pr-2 py-1.5">Conv %</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.countryCode + r.country} className="border-t border-border/50">
                            <td className="pl-2 py-1.5">
                                <span className="inline-flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "fi rounded-sm shadow-sm flex-shrink-0",
                                            r.countryCode && r.countryCode !== "xx" ? `fi-${r.countryCode}` : ""
                                        )}
                                        style={{ width: 18, height: 13 }}
                                        aria-hidden
                                    />
                                    {r.country}
                                </span>
                            </td>
                            <td className="text-right tabular-nums py-1.5">
                                <div className="inline-flex items-center gap-2">
                                    <span className="text-muted-foreground">{r.visitors}</span>
                                    <span className="inline-block w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <span
                                            className="block h-full bg-primary"
                                            style={{ width: `${(r.visitors / maxV) * 100}%` }}
                                        />
                                    </span>
                                </div>
                            </td>
                            <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.submits}</td>
                            <td className="text-right tabular-nums pr-2 py-1.5 font-medium">{fmtPct(r.conversionPct)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CityTable({
    rows,
    loading,
    emptyMsg,
}: {
    rows: GeoCityRow[];
    loading: boolean;
    emptyMsg?: string;
}) {
    if (loading) return <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>;
    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-6">{emptyMsg ?? "No data yet."}</p>;
    }
    const maxV = Math.max(...rows.map((r) => r.visitors), 1);
    return (
        <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                    <tr>
                        <th className="text-left font-medium pl-2 py-1.5">City</th>
                        <th className="text-right font-medium py-1.5">Visitors</th>
                        <th className="text-right font-medium py-1.5">Submits</th>
                        <th className="text-right font-medium pr-2 py-1.5">Conv %</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.city} className="border-t border-border/50">
                            <td className="pl-2 py-1.5">{r.city}</td>
                            <td className="text-right tabular-nums py-1.5">
                                <div className="inline-flex items-center gap-2">
                                    <span className="text-muted-foreground">{r.visitors}</span>
                                    <span className="inline-block w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <span
                                            className="block h-full bg-primary"
                                            style={{ width: `${(r.visitors / maxV) * 100}%` }}
                                        />
                                    </span>
                                </div>
                            </td>
                            <td className="text-right tabular-nums py-1.5 text-muted-foreground">{r.submits}</td>
                            <td className="text-right tabular-nums pr-2 py-1.5 font-medium">{fmtPct(r.conversionPct)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
