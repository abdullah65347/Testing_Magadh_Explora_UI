import api from "../client";
import type { Page } from "./contactService";

export interface ReviewPayload {
    packageId: number;
    authorName: string;
    authorEmail?: string;
    rating: number;
    title?: string;
    body: string;
}

export interface Review {
    id: number;
    packageId: number;
    authorName: string;
    authorEmail?: string;
    rating: number;
    title?: string;
    body: string;
    approved: boolean;
    createdAt: string;
}

export const reviewService = {
    submit: async (payload: ReviewPayload): Promise<Review> => {
        const res = await api.post<Review>("/api/reviews", payload);
        return res.data;
    },
    listForPackage: async (slug: string): Promise<Review[]> => {
        const res = await api.get<Review[]>(`/api/packages/${slug}/reviews`);
        return res.data;
    },
    adminList: async (
        page = 0,
        size = 20,
        approved?: boolean
    ): Promise<Page<Review>> => {
        const res = await api.get<Page<Review>>("/api/admin/reviews", {
            params: { page, size, ...(approved !== undefined ? { approved } : {}) },
        });
        return res.data;
    },
    approve: async (id: number, approved = true): Promise<Review> => {
        const res = await api.patch<Review>(
            `/api/admin/reviews/${id}/approve`,
            null,
            { params: { approved } }
        );
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/reviews/${id}`);
    },
};
