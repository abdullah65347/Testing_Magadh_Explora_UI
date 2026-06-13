import api from "../client";
import { ENDPOINTS } from "../endpoints";
import type { LeadStatus, Page } from "./contactService";

export type BookingStatus =
    | "NEW"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    // legacy values still accepted by backend, included so old data renders
    | "PENDING"
    | "CONTACTED"
    | "CONVERTED"
    | "CLOSED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED" | "FAILED";

export interface BookingPayload {
    packageId: number;
    name: string;
    email: string;
    phone?: string;
    numTravelers: number;
    travelDate?: string | null;
    currency?: string;
    paymentMethod?: string;
    specialRequests?: string;
}

export interface BookingDto {
    id: number;
    packageId: number;
    name: string;
    email: string;
    mobile?: string;
    numTravelers: number;
    travelDate?: string;
    currency: string;
    totalAmountInr: number;
    totalAmountLocal: number;
    paymentMethod?: string;
    status: BookingStatus | LeadStatus;
    paymentStatus?: PaymentStatus;
    cancellationReason?: string;
    internalNotes?: string;
    cancelledAt?: string;
    confirmedAt?: string;
    paidAt?: string;
    viewToken?: string;
    createdAt: string;
}

export interface BookingView {
    booking: BookingDto;
    pkg?: {
        id: number;
        slug: string;
        title: string;
        summary?: string;
        durationDays?: number;
        heroImageUrl?: string;
    };
}

export interface BookingListFilters {
    page?: number;
    size?: number;
    status?: BookingStatus | "";
    paymentStatus?: PaymentStatus | "";
    from?: string;
    to?: string;
}

export const bookingService = {
    submit: async (payload: BookingPayload): Promise<BookingDto> => {
        const res = await api.post<BookingDto>(ENDPOINTS.BOOKING, payload);
        return res.data;
    },
    viewByToken: async (token: string): Promise<BookingView> => {
        const res = await api.get<BookingView>(`${ENDPOINTS.BOOKING}/view/${token}`);
        return res.data;
    },
    lookup: async (id: number, email: string): Promise<{ token: string }> => {
        const res = await api.post<{ token: string }>(`${ENDPOINTS.BOOKING}/lookup`, { id, email });
        return res.data;
    },
    mine: async (): Promise<BookingDto[]> => {
        const res = await api.get<BookingDto[]>(`${ENDPOINTS.BOOKING}/me`);
        return res.data;
    },

    adminList: async (filters: BookingListFilters = {}): Promise<Page<BookingDto>> => {
        const params: Record<string, string | number> = {
            page: filters.page ?? 0,
            size: filters.size ?? 20,
        };
        if (filters.status) params.status = filters.status;
        if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        const res = await api.get<Page<BookingDto>>(ENDPOINTS.ADMIN.BOOKINGS, { params });
        return res.data;
    },
    adminGet: async (id: number): Promise<BookingDto> => {
        const res = await api.get<BookingDto>(`${ENDPOINTS.ADMIN.BOOKINGS}/${id}`);
        return res.data;
    },
    updateStatus: async (id: number, status: BookingStatus): Promise<BookingDto> => {
        const res = await api.patch<BookingDto>(`${ENDPOINTS.ADMIN.BOOKINGS}/${id}/status`, { status });
        return res.data;
    },
    updatePaymentStatus: async (id: number, paymentStatus: PaymentStatus): Promise<BookingDto> => {
        const res = await api.patch<BookingDto>(
            `${ENDPOINTS.ADMIN.BOOKINGS}/${id}/payment-status`,
            { paymentStatus }
        );
        return res.data;
    },
    updateNotes: async (id: number, notes: string): Promise<BookingDto> => {
        const res = await api.patch<BookingDto>(
            `${ENDPOINTS.ADMIN.BOOKINGS}/${id}/notes`,
            { notes }
        );
        return res.data;
    },
    cancel: async (id: number, reason: string): Promise<BookingDto> => {
        const res = await api.post<BookingDto>(
            `${ENDPOINTS.ADMIN.BOOKINGS}/${id}/cancel`,
            { reason }
        );
        return res.data;
    },
    csvExportUrl: (filters: BookingListFilters = {}): string => {
        const qs = new URLSearchParams();
        if (filters.status) qs.set("status", filters.status);
        if (filters.paymentStatus) qs.set("paymentStatus", filters.paymentStatus);
        if (filters.from) qs.set("from", filters.from);
        if (filters.to) qs.set("to", filters.to);
        const query = qs.toString();
        return `${ENDPOINTS.ADMIN.BOOKINGS}.csv${query ? "?" + query : ""}`;
    },
};
