import api from "../client";
import { ENDPOINTS } from "../endpoints";
import type { LeadStatus, Page } from "./contactService";

export type AbandonedLeadSource =
    | "quote-modal"
    | "book-now-modal"
    | "package-detail-quote"
    | "contact-page";

export interface AbandonedLeadCapture {
    source: AbandonedLeadSource;
    name?: string;
    email: string;
    mobile?: string;
    /** JSON-stringified blob of the partial form state for context */
    formState?: string;
}

export interface AbandonedLeadDto {
    id: number;
    source: AbandonedLeadSource;
    name?: string;
    email: string;
    mobile?: string;
    formState?: string;
    status: LeadStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    attempts: number;
    lastTouchedAt?: string;
    nextTouchAt?: string;
    lastTouchChannel?: string;
}

export const abandonedLeadService = {
    /**
     * Best-effort capture. Uses sendBeacon when available so it fires even during
     * page unload. Silently swallows errors — we never want this to break the UX.
     */
    capture: async (payload: AbandonedLeadCapture, useBeacon = false): Promise<void> => {
        try {
            const url = "/api/leads/abandoned";
            const body = JSON.stringify(payload);

            if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
                const baseURL = (api.defaults.baseURL ?? "").replace(/\/$/, "");
                navigator.sendBeacon(
                    baseURL + url,
                    new Blob([body], { type: "application/json" })
                );
                return;
            }

            await api.post(url, payload);
        } catch {
            // intentionally silent
        }
    },

    adminList: async (page = 0, size = 20): Promise<Page<AbandonedLeadDto>> => {
        const res = await api.get<Page<AbandonedLeadDto>>("/api/admin/leads/abandoned", {
            params: { page, size },
        });
        return res.data;
    },
    updateStatus: async (id: number, status: LeadStatus): Promise<AbandonedLeadDto> => {
        const res = await api.patch<AbandonedLeadDto>(
            `/api/admin/leads/abandoned/${id}/status`,
            { status }
        );
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/leads/abandoned/${id}`);
    },

    /** Resolve a recovery token from an email link → returns the lead so the SPA can prefill. */
    resolve: async (token: string): Promise<AbandonedLeadDto> => {
        const res = await api.get<AbandonedLeadDto>(ENDPOINTS.ABANDONED_RECOVERY(token));
        return res.data;
    },

    /** Admin manual reminder. touch is optional (1|2|3) — defaults to the next one in sequence. */
    sendTouch: async (id: number, touch?: 1 | 2 | 3): Promise<AbandonedLeadDto> => {
        const res = await api.post<AbandonedLeadDto>(
            `/api/admin/leads/abandoned/${id}/send-touch`,
            touch != null ? { touch } : {},
        );
        return res.data;
    },
};
