import api from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "./categoryService";

export interface Blog {
    id: number;
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string;
    author?: string;
    publishedAt?: string;
    published: boolean;
    createdAt?: string;
    updatedAt?: string;
    /** Read-only — populated by backend */
    categories?: Category[];
}

export type BlogInput = Omit<Blog, "id" | "createdAt" | "updatedAt" | "categories"> & {
    /** Write-only — IDs of attached categories */
    categoryIds?: number[];
};

export const blogService = {
    list: async (): Promise<Blog[]> => {
        const res = await api.get(ENDPOINTS.BLOGS.LIST);
        return res.data;
    },
    get: async (slugOrId: string | number): Promise<Blog> => {
        const res = await api.get(ENDPOINTS.BLOGS.DETAIL(slugOrId));
        return res.data;
    },
    adminList: async (): Promise<Blog[]> => {
        const res = await api.get(ENDPOINTS.ADMIN.BLOGS);
        return res.data;
    },
    adminGet: async (id: number): Promise<Blog> => {
        const res = await api.get(`${ENDPOINTS.ADMIN.BLOGS}/${id}`);
        return res.data;
    },
    create: async (data: BlogInput): Promise<Blog> => {
        const res = await api.post(ENDPOINTS.ADMIN.BLOGS, data);
        return res.data;
    },
    update: async (id: number, data: BlogInput): Promise<Blog> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.BLOGS}/${id}`, data);
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`${ENDPOINTS.ADMIN.BLOGS}/${id}`);
    },
};
