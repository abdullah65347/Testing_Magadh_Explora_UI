import api from "../client";
import { API_BASE_URL } from "@/config/env";

export type JourneyMediaType = "photo" | "video" | "reel";

export interface JourneyPost {
    id: number;
    name: string;
    location: string | null;
    caption: string | null;
    mediaType: JourneyMediaType;
    mediaUrl: string;
    videoUrl: string | null;
    likes: number;
    approved: boolean;
    createdAt: string;
}

export interface JourneySubmitPayload {
    name: string;
    location?: string;
    caption?: string;
    mediaType: JourneyMediaType;
    mediaUrl: string;
    videoUrl?: string;
}

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/** Make a backend-relative /uploads path absolute for <img src>. */
export function resolveMediaUrl(url: string): string {
    if (!url) return url;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

export const journeyService = {
    /** Public image upload — returns the stored (relative) URL. */
    uploadMedia: async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post<{ url: string }>("/api/journey-posts/media", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.url;
    },

    /** Public submit — created unapproved, awaiting moderation. */
    submit: async (payload: JourneySubmitPayload): Promise<JourneyPost> => {
        const res = await api.post<JourneyPost>("/api/journey-posts", payload);
        return res.data;
    },

    /** Public approved feed, optionally filtered by media type. */
    listPublic: async (type?: JourneyMediaType): Promise<JourneyPost[]> => {
        const res = await api.get<JourneyPost[]>("/api/journey-posts", {
            params: type ? { type } : {},
        });
        return res.data;
    },

    // ---- admin ----
    adminList: async (approved?: boolean, page = 0, size = 30): Promise<Page<JourneyPost>> => {
        const params: Record<string, unknown> = { page, size };
        if (approved !== undefined) params.approved = approved;
        const res = await api.get<Page<JourneyPost>>("/api/admin/journey-posts", { params });
        return res.data;
    },
    pendingCount: async (): Promise<number> => {
        const res = await api.get<{ pending: number }>("/api/admin/journey-posts/pending-count");
        return res.data.pending;
    },
    approve: async (id: number, approved = true): Promise<JourneyPost> => {
        const res = await api.patch<JourneyPost>(`/api/admin/journey-posts/${id}/approve`, null, {
            params: { approved },
        });
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/journey-posts/${id}`);
    },
};
