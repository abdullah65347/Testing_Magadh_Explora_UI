import api from "../client";
import { ENDPOINTS } from "../endpoints";

export type CategoryKind = "THEME" | "TIER" | "GENERIC";

export interface Category {
    id: number;
    slug: string;
    kind: CategoryKind;
    name: string;
    description?: string;
    displayOrder: number;
    active: boolean;
}

export type CategoryInput = Omit<Category, "id">;

export const categoryService = {
    list: async (kind?: CategoryKind): Promise<Category[]> => {
        const res = await api.get(ENDPOINTS.CATEGORIES.LIST, { params: kind ? { kind } : {} });
        return res.data;
    },
    create: async (data: CategoryInput): Promise<Category> => {
        const res = await api.post(ENDPOINTS.ADMIN.CATEGORIES, data);
        return res.data;
    },
    update: async (id: number, data: CategoryInput): Promise<Category> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.CATEGORIES}/${id}`, data);
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`${ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
    },
};
