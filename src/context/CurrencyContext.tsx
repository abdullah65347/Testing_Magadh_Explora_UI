import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { geoService, type GeoInfo } from "@/api/services/geoService";
import { currencyService, type CurrencySnapshot } from "@/api/services/currencyService";
import { convertPrice, formatCurrency } from "@/lib/price";

interface CurrencyContextValue {
    /** Active display currency (ISO 4217) */
    currency: string;
    /** Switch the active currency manually */
    setCurrency: (code: string) => void;
    /** Currencies the admin has enabled */
    allowedCurrencies: string[];
    /** Geo-detected suggestion (may differ from active currency if user overrode) */
    suggestedFromGeo?: string;
    /** Snapshot from the backend — null while loading */
    snapshot?: CurrencySnapshot;
    /** Geo result */
    geo?: GeoInfo;
    /** Loading flag for first paint */
    loading: boolean;
    /** Convert INR amount → active currency value (with markup) */
    convert: (inrAmount: number) => number;
    /** Convert + format with the active currency */
    formatPrice: (inrAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "magadh.currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const snapshotQ = useQuery({
        queryKey: ["public", "currency"],
        queryFn: currencyService.snapshot,
        staleTime: 1000 * 60 * 60, // 1h
    });
    const geoQ = useQuery({
        queryKey: ["geo"],
        queryFn: geoService.lookup,
        staleTime: 1000 * 60 * 60 * 24,
        retry: false,
    });

    const [currency, setCurrencyState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) ?? "";
    });

    // Once snapshot + geo load, pick a default currency if user hasn't chosen one.
    useEffect(() => {
        if (currency) return;
        const snap = snapshotQ.data;
        if (!snap) return;
        const fromGeo = geoQ.data?.currency;
        const allowed = new Set(snap.allowedCurrencies);
        const fallback = snap.defaultCurrency || "INR";
        const picked = fromGeo && allowed.has(fromGeo) ? fromGeo : fallback;
        setCurrencyState(picked);
    }, [currency, snapshotQ.data, geoQ.data]);

    const setCurrency = useCallback((code: string) => {
        setCurrencyState(code);
        localStorage.setItem(STORAGE_KEY, code);
    }, []);

    const value = useMemo<CurrencyContextValue>(() => {
        const snap = snapshotQ.data;
        const active = currency || snap?.defaultCurrency || "INR";
        const rates = snap?.ratesToInr ?? { INR: 1 };
        const markup = snap?.markupPercent ?? 0;
        return {
            currency: active,
            setCurrency,
            allowedCurrencies: snap?.allowedCurrencies ?? ["INR"],
            suggestedFromGeo: geoQ.data?.currency,
            snapshot: snap,
            geo: geoQ.data,
            loading: snapshotQ.isLoading || geoQ.isLoading,
            convert: (inr: number) => convertPrice(inr, active, rates, markup),
            formatPrice: (inr: number) => {
                const v = convertPrice(inr, active, rates, markup);
                return formatCurrency(v, active);
            },
        };
    }, [currency, setCurrency, snapshotQ.data, snapshotQ.isLoading, geoQ.data, geoQ.isLoading]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
    return ctx;
}
