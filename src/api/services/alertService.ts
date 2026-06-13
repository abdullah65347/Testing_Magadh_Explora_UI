import api from "../client";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Alert {
    id: number;
    ruleId: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    payload: string | null;
    dedupeKey: string;
    read: boolean;
    emailSent: boolean;
    createdAt: string;
}

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const alertService = {
    list: async (page = 0, size = 20): Promise<Page<Alert>> => {
        const res = await api.get<Page<Alert>>("/api/admin/alerts", { params: { page, size } });
        return res.data;
    },
    unreadCount: async (): Promise<number> => {
        const res = await api.get<{ unread: number }>("/api/admin/alerts/unread-count");
        return res.data.unread;
    },
    markRead: async (id: number): Promise<Alert> => {
        const res = await api.patch<Alert>(`/api/admin/alerts/${id}/read`);
        return res.data;
    },
    markAllRead: async (): Promise<number> => {
        const res = await api.post<{ marked: number }>("/api/admin/alerts/read-all");
        return res.data.marked;
    },
    scan: async (): Promise<void> => {
        await api.post("/api/admin/alerts/scan");
    },
};
