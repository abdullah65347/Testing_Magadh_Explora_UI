import api from "../client";
import { ENDPOINTS } from "../endpoints";

export type HomepageEntityType = "PACKAGE" | "DESTINATION" | "BLOG";

export interface HomepageSectionItem {
    id?: number;
    entityType: HomepageEntityType;
    entityId: number;
    displayOrder: number;
}

export interface HomepageSection {
    id: number;
    sectionKey: string;
    title: string;
    displayOrder: number;
    active: boolean;
    maxItems: number;
    items: HomepageSectionItem[];
}

export interface HomepageSectionInput {
    sectionKey: string;
    title: string;
    displayOrder: number;
    active: boolean;
    maxItems: number;
}

export const homepageService = {
    publicLayout: async (): Promise<HomepageSection[]> => {
        const res = await api.get(ENDPOINTS.HOMEPAGE);
        return res.data;
    },
    adminLayout: async (): Promise<HomepageSection[]> => {
        const res = await api.get(ENDPOINTS.ADMIN.HOMEPAGE);
        return res.data;
    },
    createSection: async (data: HomepageSectionInput): Promise<HomepageSection> => {
        const res = await api.post(ENDPOINTS.ADMIN.HOMEPAGE, data);
        return res.data;
    },
    updateSection: async (id: number, data: HomepageSectionInput): Promise<HomepageSection> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.HOMEPAGE}/${id}`, data);
        return res.data;
    },
    deleteSection: async (id: number): Promise<void> => {
        await api.delete(`${ENDPOINTS.ADMIN.HOMEPAGE}/${id}`);
    },
    replaceItems: async (id: number, items: Omit<HomepageSectionItem, "id">[]): Promise<HomepageSection> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.HOMEPAGE}/${id}/items`, items);
        return res.data;
    },
};
