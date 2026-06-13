import api from "../client";
import { ENDPOINTS } from "../endpoints";

export interface CurrencySnapshot {
    /** Map of currency code → "1 currency = X INR" */
    ratesToInr: Record<string, number>;
    markupPercent: number;
    defaultCurrency: string;
    allowedCurrencies: string[];
    updatedAt: string;
}

export const currencyService = {
    snapshot: async (): Promise<CurrencySnapshot> => {
        const res = await api.get<CurrencySnapshot>(ENDPOINTS.PUBLIC_CURRENCY);
        // axios deserializes BigDecimal as number — normalize for safety
        const data = res.data;
        const norm: Record<string, number> = {};
        Object.entries(data.ratesToInr ?? {}).forEach(([k, v]) => {
            norm[k] = typeof v === "string" ? parseFloat(v) : (v as number);
        });
        return {
            ...data,
            ratesToInr: norm,
            markupPercent:
                typeof data.markupPercent === "string"
                    ? parseFloat(data.markupPercent)
                    : (data.markupPercent as number),
        };
    },
    refresh: async (): Promise<{ updated: number }> => {
        const res = await api.post(ENDPOINTS.ADMIN.CURRENCY_REFRESH, {});
        return res.data;
    },
};
