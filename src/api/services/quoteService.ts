import api from "../client";
import { ENDPOINTS } from "../endpoints";
import type { LeadStatus, Page } from "./contactService";

export interface QuotePayload {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    travelerType?: string;
    packageTier?: string;
    destinations?: string[] | string;
    travelDates?: string | null;
    groupSize?: number | null;
    budget?: string;
    requirements?: string;
}

export interface QuoteDto {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    country?: string;
    travelerType?: string;
    packageTier?: string;
    destinations?: string;
    travelDate?: string;
    numTravelers?: number;
    budget?: string;
    message?: string;
    status: LeadStatus;
    createdAt: string;
}

export const quoteService = {
    submit: async (payload: QuotePayload): Promise<QuoteDto> => {
        const res = await api.post<QuoteDto>(ENDPOINTS.QUOTE, payload);
        return res.data;
    },
    adminList: async (page = 0, size = 20): Promise<Page<QuoteDto>> => {
        const res = await api.get<Page<QuoteDto>>(ENDPOINTS.ADMIN.QUOTES, {
            params: { page, size },
        });
        return res.data;
    },
    updateStatus: async (id: number, status: LeadStatus): Promise<QuoteDto> => {
        const res = await api.patch<QuoteDto>(`${ENDPOINTS.ADMIN.QUOTES}/${id}/status`, { status });
        return res.data;
    },
};
