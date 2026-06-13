/**
 * Convert an INR base price to the active currency, applying the admin markup.
 *
 * Rates are stored as "1 <currency> = N INR", so:
 *   priceInLocal = (inr / rateToInr[currency]) * (1 + markupPercent / 100)
 */
export function convertPrice(
    inrAmount: number,
    currency: string,
    ratesToInr: Record<string, number>,
    markupPercent = 0
): number {
    const rate = ratesToInr[currency] ?? 1;
    if (rate <= 0) return inrAmount;
    const base = inrAmount / rate;
    return base * (1 + (markupPercent || 0) / 100);
}

/** Format a number with the right currency symbol via Intl.NumberFormat. */
export function formatCurrency(value: number, currency: string, locale?: string): string {
    try {
        const fractionDigits = currency === "JPY" || currency === "KRW" || currency === "VND" ? 0 : 0;
        return new Intl.NumberFormat(locale ?? "en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: fractionDigits,
            minimumFractionDigits: fractionDigits,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString()}`;
    }
}
