import api from "../client";

export interface AnalyticsOverview {
    trackingEnabled: boolean;
    visitorsToday: number | null;
    visitorsDeltaPct: number | null;
    liveActiveUsers: number | null;
    topSource: { name: string; visitors: number } | null;
    enquiriesToday: number;
    enquiriesDeltaPct: number | null;
    bookingsToday: number;
    bookingsDeltaPct: number | null;
    revenueTodayInr: number;
    revenueDeltaPct: number | null;
}

export interface AnalyticsSummary {
    totalBookings: number;
    confirmed: number;
    cancelled: number;
    paid: number;
    totalRevenueInr: number;
    pipelineInr: number;
    avgBookingValueInr: number;
    contactCount: number;
    quoteCount: number;
    conversionRate: number;
}

export interface RevenueSeriesPoint {
    date: string;
    bookings: number;
    revenueInr: number;
}

export interface PackageRevenueRow {
    packageId: number;
    title: string;
    bookings: number;
    paidBookings: number;
    revenueInr: number;
}

export interface StatusDistribution {
    byStatus: Record<string, number>;
    byPayment: Record<string, number>;
}

export interface Funnel {
    contacts: number;
    quotes: number;
    bookings: number;
    paid: number;
}

export interface VisitorsSeriesPoint {
    date: string;
    visitors: number;
}

export interface TopSourceRow {
    source: string;
    visitors: number;
}

export interface TopCountryRow {
    countryCode: string;
    country: string;
    visitors: number;
}

export interface FunnelStage {
    id: string;
    label: string;
    count: number | null;
    instrumented: boolean;
}

export interface FunnelV2Response {
    stages: FunnelStage[];
    whatsappClicks: number;
}

export interface GeoCountryRow {
    countryCode: string;
    country: string;
    visitors: number;
    submits: number;
    conversionPct: number | null;
}

export interface GeoCityRow {
    city: string;
    visitors: number;
    submits: number;
    conversionPct: number | null;
}

export interface FunnelFilters {
    from?: string;
    to?: string;
    country?: string;
    source?: string;
    device?: string;
}

export interface PackageViewRow {
    packageId: number;
    title: string;
    slug: string | null;
    views: number;
    uniqueVisitors: number;
}

export interface PackageConversionRow {
    packageId: number;
    title: string;
    slug: string | null;
    viewers: number;
    submitters: number;
    conversionPct: number | null;
}

export interface PackageCountryRow {
    packageId: number;
    title: string;
    countryCode: string;
    country: string;
    viewers: number;
}

export interface PathRow {
    path: string;
    views: number;
    uniqueVisitors: number;
}

export interface LandingPathRow {
    path: string;
    sessions: number;
}

export interface BehaviorPages {
    topPaths: PathRow[];
    topLandingPaths: LandingPathRow[];
}

export interface WhatsappStats {
    total: number;
    byCountry: Array<{ countryCode: string; country: string; clicks: number }>;
}

export interface FormAbandonmentRow {
    form: string;
    started: number;
    submitted: number;
    abandoned: number;
    abandonmentPct: number | null;
}

interface DateRange { from?: string; to?: string }

export interface ForecastPoint {
    date: string;
    actual: number | null;
    projected: number | null;
    lower: number | null;
    upper: number | null;
}

export interface ForecastResponse {
    sufficient: boolean;
    historyDays: number;
    horizonDays: number;
    slopePerDay: number;
    r2: number;
    note: string | null;
    series: ForecastPoint[];
    horizonTotal: number;
}

export interface ForecastCard {
    sufficient: boolean;
    note?: string | null;
    horizonTotal: number | null;
    priorPeriodTotal: number | null;
    deltaPct: number | null;
}

export interface ForecastSummaryResponse {
    horizonDays: number;
    visitors: ForecastCard;
    bookings: ForecastCard;
    revenue: ForecastCard;
}

export interface PaymentMixRow {
    method: string;
    bookings: number;
    revenueInr: number;
}

export interface LeadTimeBucket {
    bucket: string;
    count: number;
}

export interface CurrencyMixRow {
    currency: string;
    bookings: number;
}

export interface SalesExtras {
    paymentMix: PaymentMixRow[];
    leadTime: LeadTimeBucket[];
    leadTimeStats: { avgDays: number | null; samples: number };
    cancellation: { cancelled: number; total: number; ratePct: number; revenueLostInr: number };
    winRate: { paid: number; total: number; ratePct: number };
    currencyMix: CurrencyMixRow[];
}

export interface CohortRow {
    month: string;
    size: number;
    retention: Array<{ offset: number; count: number; pct: number }>;
}

export interface CohortResponse {
    horizonMonths: number;
    cohorts: CohortRow[];
}

export interface LtvCustomerRow {
    email: string;
    name: string;
    bookings: number;
    revenueInr: number;
}

export interface LtvResponse {
    totalCustomers: number;
    repeatCustomers: number;
    repeatRatePct: number;
    totalRevenueInr: number;
    avgLtvInr: number;
    topCustomers: LtvCustomerRow[];
}

export interface SeasonalityRow {
    month: string;
    bookings: number;
    revenueInr: number;
}

export interface AttributionRow {
    source: string;
    bookings: number;
    revenueInr: number;
}

export interface AttributionResponse {
    attributedBookings: number;
    unattributedBookings: number;
    totalRevenueInr: number;
    firstTouch: AttributionRow[];
    lastTouch: AttributionRow[];
}

export type LeadTier = "HOT" | "WARM" | "COLD";

export interface HotLeadRow {
    type: "quote" | "contact" | "booking";
    id: number;
    name: string;
    email: string;
    country: string | null;
    score: number;
    tier: LeadTier;
    reason: string;
    createdAt: string;
    href: string;
}

interface RangeParams {
    from?: string;
    to?: string;
}

export const analyticsService = {
    overview: async (): Promise<AnalyticsOverview> => {
        const res = await api.get<AnalyticsOverview>("/api/admin/analytics/overview");
        return res.data;
    },
    visitorsSeries: async (range: 30 | 90 | 365 = 30): Promise<VisitorsSeriesPoint[]> => {
        const res = await api.get<VisitorsSeriesPoint[]>("/api/admin/analytics/visitors-series", {
            params: { range },
        });
        return res.data;
    },
    topSources: async (limit = 5): Promise<TopSourceRow[]> => {
        const res = await api.get<TopSourceRow[]>("/api/admin/analytics/top-sources", { params: { limit } });
        return res.data;
    },
    topCountries: async (limit = 5): Promise<TopCountryRow[]> => {
        const res = await api.get<TopCountryRow[]>("/api/admin/analytics/top-countries", { params: { limit } });
        return res.data;
    },
    funnelV2: async (filters: FunnelFilters = {}): Promise<FunnelV2Response> => {
        const res = await api.get<FunnelV2Response>("/api/admin/analytics/funnel-v2", { params: filters });
        return res.data;
    },
    geoCountries: async (params: { from?: string; to?: string; limit?: number } = {}): Promise<GeoCountryRow[]> => {
        const res = await api.get<GeoCountryRow[]>("/api/admin/analytics/geo/countries", { params });
        return res.data;
    },
    geoCities: async (params: { from?: string; to?: string; country?: string; limit?: number } = {}): Promise<GeoCityRow[]> => {
        const res = await api.get<GeoCityRow[]>("/api/admin/analytics/geo/cities", { params });
        return res.data;
    },
    packageViews: async (params: DateRange & { limit?: number } = {}): Promise<PackageViewRow[]> => {
        const res = await api.get<PackageViewRow[]>("/api/admin/analytics/packages/views", { params });
        return res.data;
    },
    packageConversion: async (params: DateRange & { limit?: number } = {}): Promise<PackageConversionRow[]> => {
        const res = await api.get<PackageConversionRow[]>("/api/admin/analytics/packages/conversion", { params });
        return res.data;
    },
    packageCountries: async (params: DateRange & { limit?: number } = {}): Promise<PackageCountryRow[]> => {
        const res = await api.get<PackageCountryRow[]>("/api/admin/analytics/packages/countries", { params });
        return res.data;
    },
    behaviorPages: async (params: DateRange & { limit?: number } = {}): Promise<BehaviorPages> => {
        const res = await api.get<BehaviorPages>("/api/admin/analytics/behavior/pages", { params });
        return res.data;
    },
    behaviorWhatsapp: async (params: DateRange & { limit?: number } = {}): Promise<WhatsappStats> => {
        const res = await api.get<WhatsappStats>("/api/admin/analytics/behavior/whatsapp", { params });
        return res.data;
    },
    behaviorFormAbandonment: async (params: DateRange = {}): Promise<FormAbandonmentRow[]> => {
        const res = await api.get<FormAbandonmentRow[]>("/api/admin/analytics/behavior/form-abandonment", { params });
        return res.data;
    },
    hotLeads: async (limit = 10): Promise<HotLeadRow[]> => {
        const res = await api.get<HotLeadRow[]>("/api/admin/analytics/hot-leads", { params: { limit } });
        return res.data;
    },
    cohort: async (months = 6): Promise<CohortResponse> => {
        const res = await api.get<CohortResponse>("/api/admin/analytics/retention/cohort", { params: { months } });
        return res.data;
    },
    ltv: async (limit = 10): Promise<LtvResponse> => {
        const res = await api.get<LtvResponse>("/api/admin/analytics/retention/ltv", { params: { limit } });
        return res.data;
    },
    seasonality: async (months = 12): Promise<SeasonalityRow[]> => {
        const res = await api.get<SeasonalityRow[]>("/api/admin/analytics/retention/seasonality", { params: { months } });
        return res.data;
    },
    attribution: async (params: DateRange = {}): Promise<AttributionResponse> => {
        const res = await api.get<AttributionResponse>("/api/admin/analytics/retention/attribution", { params });
        return res.data;
    },
    forecastSummary: async (horizonDays = 30): Promise<ForecastSummaryResponse> => {
        const res = await api.get<ForecastSummaryResponse>("/api/admin/analytics/forecast/summary", {
            params: { horizonDays },
        });
        return res.data;
    },
    forecastVisitors: async (historyDays = 90, horizonDays = 30): Promise<ForecastResponse> => {
        const res = await api.get<ForecastResponse>("/api/admin/analytics/forecast/visitors", {
            params: { historyDays, horizonDays },
        });
        return res.data;
    },
    forecastBookings: async (historyDays = 90, horizonDays = 30): Promise<ForecastResponse> => {
        const res = await api.get<ForecastResponse>("/api/admin/analytics/forecast/bookings", {
            params: { historyDays, horizonDays },
        });
        return res.data;
    },
    forecastRevenue: async (historyDays = 90, horizonDays = 30): Promise<ForecastResponse> => {
        const res = await api.get<ForecastResponse>("/api/admin/analytics/forecast/revenue", {
            params: { historyDays, horizonDays },
        });
        return res.data;
    },
    salesExtras: async (params: DateRange = {}): Promise<SalesExtras> => {
        const res = await api.get<SalesExtras>("/api/admin/analytics/sales/extras", { params });
        return res.data;
    },
    summary: async (params: RangeParams = {}): Promise<AnalyticsSummary> => {
        const res = await api.get<AnalyticsSummary>("/api/admin/analytics/summary", { params });
        return res.data;
    },
    revenueSeries: async (
        params: RangeParams & { groupBy?: "day" | "week" | "month" } = {}
    ): Promise<RevenueSeriesPoint[]> => {
        const res = await api.get<RevenueSeriesPoint[]>("/api/admin/analytics/revenue-series", {
            params,
        });
        return res.data;
    },
    byPackage: async (params: RangeParams & { limit?: number } = {}): Promise<PackageRevenueRow[]> => {
        const res = await api.get<PackageRevenueRow[]>("/api/admin/analytics/by-package", { params });
        return res.data;
    },
    statusDistribution: async (params: RangeParams = {}): Promise<StatusDistribution> => {
        const res = await api.get<StatusDistribution>("/api/admin/analytics/status-distribution", {
            params,
        });
        return res.data;
    },
    funnel: async (params: RangeParams = {}): Promise<Funnel> => {
        const res = await api.get<Funnel>("/api/admin/analytics/funnel", { params });
        return res.data;
    },
};
