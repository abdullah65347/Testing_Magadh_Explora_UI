import api from "../client";
import { ENDPOINTS } from "../endpoints";

export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED" | "CANCELLED";

export interface ContactPayload {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message?: string;
}

export interface ContactDto {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    subject?: string;
    message?: string;
    status: LeadStatus;
    createdAt: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const contactService = {
    submit: async (payload: ContactPayload): Promise<ContactDto> => {
        const res = await api.post<ContactDto>(ENDPOINTS.CONTACT, payload);
        return res.data;
    },
    adminList: async (page = 0, size = 20): Promise<Page<ContactDto>> => {
        const res = await api.get<Page<ContactDto>>(ENDPOINTS.ADMIN.CONTACTS, {
            params: { page, size },
        });
        return res.data;
    },
    updateStatus: async (id: number, status: LeadStatus): Promise<ContactDto> => {
        const res = await api.patch<ContactDto>(`${ENDPOINTS.ADMIN.CONTACTS}/${id}/status`, { status });
        return res.data;
    },
};
