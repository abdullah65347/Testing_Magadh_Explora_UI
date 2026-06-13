import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { alertService } from "@/api/services/alertService";
import {
    Package,
    MapPin,
    Tag,
    BookOpen,
    Plus,
    Users,
    Radio,
    Send,
    Briefcase,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard,
    Globe2,
    Filter as FilterIcon,
    Boxes,
    Activity,
    Bell,
    Repeat,
    Sparkles,
    BarChart3,
} from "lucide-react";
import { packageService } from "@/api/services/packageService";
import { destinationService } from "@/api/services/destinationService";
import { categoryService } from "@/api/services/categoryService";
import { analyticsService, type AnalyticsOverview } from "@/api/services/analyticsService";
import { cn } from "@/lib/utils";
import DashboardAnalyticsRow from "@/components/admin/DashboardAnalyticsRow";
import AdminGeography from "./Geography";
import AdminFunnel from "./Funnel";
import PackagesAnalytics from "./PackagesAnalytics";
import AdminBehavior from "./Behavior";
import AdminAlerts from "./Alerts";
import AdminRetention from "./Retention";
import AdminForecast from "./Forecast";
import AdminSales from "./Analytics";
import HotLeadsWidget from "@/components/admin/HotLeadsWidget";

type TabId = "overview" | "sales" | "geography" | "funnel" | "packages" | "behavior" | "retention" | "forecast" | "alerts";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "sales", label: "Sales", icon: BarChart3 },
    { id: "geography", label: "Geography", icon: Globe2 },
    { id: "funnel", label: "Funnel", icon: FilterIcon },
    { id: "packages", label: "Packages", icon: Boxes },
    { id: "behavior", label: "Behavior", icon: Activity },
    { id: "retention", label: "Retention", icon: Repeat },
    { id: "forecast", label: "Forecast", icon: Sparkles },
    { id: "alerts", label: "Alerts", icon: Bell },
];

function fmtInr(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString()}`;
}

function fmtNum(n: number | null | undefined): string {
    if (n == null) return "—";
    return n.toLocaleString();
}

function Delta({ pct }: { pct: number | null | undefined }) {
    if (pct == null) return <span className="text-xs text-muted-foreground">vs last week</span>;
    const up = pct >= 0;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                up ? "text-green-600" : "text-red-600"
            )}
        >
            <Icon className="w-3 h-3" />
            {Math.abs(pct).toFixed(1)}% <span className="text-muted-foreground font-normal ml-1">vs last week</span>
        </span>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    delta,
    sublabel,
    color = "primary",
    pulsing = false,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    delta?: number | null;
    sublabel?: string;
    color?: "primary" | "green" | "amber" | "indigo" | "rose";
    pulsing?: boolean;
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
            <div className="flex items-start justify-between gap-2 mb-3">
                <span className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorMap[color])}>
                    <Icon className="w-5 h-5" />
                </span>
                {pulsing && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        live
                    </span>
                )}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
            <div className="mt-1">
                {delta !== undefined ? <Delta pct={delta} /> : sublabel ? (
                    <span className="text-xs text-muted-foreground">{sublabel}</span>
                ) : null}
            </div>
        </div>
    );
}

function CatalogCard({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: typeof Package;
    label: string;
    value: number | string;
    href: string;
}) {
    return (
        <Link
            to={href}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
            <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
            </div>
        </Link>
    );
}

function OverviewPanel() {
    const overview = useQuery<AnalyticsOverview>({
        queryKey: ["analytics", "overview"],
        queryFn: analyticsService.overview,
        refetchInterval: 30_000,
    });
    const packages = useQuery({ queryKey: ["admin", "packages"], queryFn: packageService.adminList });
    const destinations = useQuery({ queryKey: ["admin", "destinations"], queryFn: destinationService.adminList });
    const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: () => categoryService.list() });

    const data = overview.data;
    const trackingOn = !!data?.trackingEnabled;

    return (
        <div className="space-y-6">
            {!trackingOn && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-900">
                    Visitor tracking is not enabled yet. Visitors, Live Users and Top Source will populate once the
                    tracking layer (GA4 + custom events) ships.
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard
                    icon={Users}
                    label="Visitors Today"
                    value={fmtNum(data?.visitorsToday)}
                    delta={data?.visitorsDeltaPct ?? null}
                    color="primary"
                />
                <KpiCard
                    icon={Radio}
                    label="Live Active Users"
                    value={fmtNum(data?.liveActiveUsers)}
                    sublabel="last 5 minutes"
                    color="rose"
                    pulsing={trackingOn && (data?.liveActiveUsers ?? 0) > 0}
                />
                <KpiCard
                    icon={Send}
                    label="Enquiries Today"
                    value={fmtNum(data?.enquiriesToday)}
                    delta={data?.enquiriesDeltaPct ?? null}
                    color="indigo"
                />
                <KpiCard
                    icon={Briefcase}
                    label="Bookings Today"
                    value={fmtNum(data?.bookingsToday)}
                    delta={data?.bookingsDeltaPct ?? null}
                    color="amber"
                />
                <KpiCard
                    icon={DollarSign}
                    label="Revenue Today"
                    value={fmtInr(data?.revenueTodayInr)}
                    delta={data?.revenueDeltaPct ?? null}
                    color="green"
                />
            </div>

            <DashboardAnalyticsRow />

            <HotLeadsWidget />

            <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Catalog</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <CatalogCard
                        icon={Package}
                        label="Packages"
                        value={packages.data?.length ?? "—"}
                        href="/admin/packages"
                    />
                    <CatalogCard
                        icon={MapPin}
                        label="Destinations"
                        value={destinations.data?.length ?? "—"}
                        href="/admin/destinations"
                    />
                    <CatalogCard
                        icon={Tag}
                        label="Categories"
                        value={categories.data?.length ?? "—"}
                        href="/admin/categories"
                    />
                    <CatalogCard
                        icon={BookOpen}
                        label="Blog Posts"
                        value="—"
                        href="/admin/blog"
                    />
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const rawTab = searchParams.get("tab");
    const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "overview";

    const unreadAlerts = useQuery({
        queryKey: ["alerts-unread"],
        queryFn: alertService.unreadCount,
        refetchInterval: 60_000,
    });

    const setTab = (id: TabId) => {
        const next = new URLSearchParams(searchParams);
        if (id === "overview") next.delete("tab");
        else next.set("tab", id);
        setSearchParams(next, { replace: true });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        {activeTab === "overview" && "Today's snapshot · refreshes every 30s"}
                        {activeTab === "sales" && "Sales performance, payment mix, lead time, win and cancellation rates."}
                        {activeTab === "geography" && "Where your visitors come from and how they convert."}
                        {activeTab === "funnel" && "Visitor journey from first visit to confirmed booking."}
                        {activeTab === "packages" && "Which packages get the most attention and convert best."}
                        {activeTab === "behavior" && "How visitors navigate, click and drop off."}
                        {activeTab === "retention" && "Cohort retention, customer LTV and multi-touch attribution."}
                        {activeTab === "forecast" && "Linear-trend projections with 95% confidence band."}
                        {activeTab === "alerts" && "Notifications from the automated scanner."}
                    </p>
                </div>
                {activeTab === "overview" && (
                    <Link
                        to="/admin/packages/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                    >
                        <Plus className="w-4 h-4" /> New Package
                    </Link>
                )}
            </div>

            {/* Sub-tabs */}
            <div className="border-b border-border">
                <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        const active = activeTab === t.id;
                        const unread = t.id === "alerts" ? (unreadAlerts.data ?? 0) : 0;
                        return (
                            <button
                                key={t.id}
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                                    active
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                                {unread > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums">
                                        {unread > 99 ? "99+" : unread}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab content */}
            <div>
                {activeTab === "overview" && <OverviewPanel />}
                {activeTab === "sales" && <AdminSales embedded />}
                {activeTab === "geography" && <AdminGeography embedded />}
                {activeTab === "funnel" && <AdminFunnel embedded />}
                {activeTab === "packages" && <PackagesAnalytics embedded />}
                {activeTab === "behavior" && <AdminBehavior embedded />}
                {activeTab === "retention" && <AdminRetention embedded />}
                {activeTab === "forecast" && <AdminForecast embedded />}
                {activeTab === "alerts" && <AdminAlerts embedded />}
            </div>
        </div>
    );
}
