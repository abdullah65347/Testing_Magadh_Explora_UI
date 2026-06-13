import api from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "./categoryService";
import type { Destination } from "./destinationService";

export type PackageMode = "PILGRIMAGE" | "HOLIDAY";

export interface PackageImage {
    id?: number;
    url: string;
    altText?: string;
    primary: boolean;
    displayOrder: number;
}

export interface Package {
    id: number;
    slug: string;
    title: string;
    summary?: string;
    description?: string;
    priceInr: number;
    originalPriceInr?: number;
    durationDays?: number;
    rating?: number;
    reviewsCount: number;
    groupSizeMin?: number;
    groupSizeMax?: number;
    heroImageUrl?: string;
    mode: PackageMode;
    travelerTypes?: string;
    itinerary?: string;
    inclusions?: string;
    exclusions?: string;
    published: boolean;
    featured: boolean;
    categories: Category[];
    destinations: Destination[];
    images: PackageImage[];
}

export interface PackageRequest {
    slug: string;
    title: string;
    summary?: string;
    description?: string;
    priceInr: number;
    originalPriceInr?: number;
    durationDays?: number;
    rating?: number;
    reviewsCount?: number;
    groupSizeMin?: number;
    groupSizeMax?: number;
    heroImageUrl?: string;
    mode: PackageMode;
    travelerTypes?: string;
    itinerary?: string;
    inclusions?: string;
    exclusions?: string;
    published: boolean;
    featured: boolean;
    categoryIds: number[];
    destinationIds: number[];
    images: PackageImage[];
}

export interface PackageFilters {
    q?: string;
    mode?: PackageMode;
    category?: string;       // category slug
    travelerType?: string;
    minDays?: number;
    maxDays?: number;
    lang?: string;
}

export const packageService = {
    list: async (filters: PackageFilters = {}): Promise<Package[]> => {
        const res = await api.get(ENDPOINTS.PACKAGES.LIST, { params: filters });
        return res.data;
    },
    get: async (slug: string, lang?: string): Promise<Package> => {
        const res = await api.get(ENDPOINTS.PACKAGES.DETAIL(slug), {
            params: lang ? { lang } : undefined,
        });
        return res.data;
    },
    adminList: async (): Promise<Package[]> => {
        const res = await api.get(ENDPOINTS.ADMIN.PACKAGES);
        return res.data;
    },
    adminGet: async (id: number): Promise<Package> => {
        const res = await api.get(`${ENDPOINTS.ADMIN.PACKAGES}/${id}`);
        return res.data;
    },
    create: async (data: PackageRequest): Promise<Package> => {
        const res = await api.post(ENDPOINTS.ADMIN.PACKAGES, data);
        return res.data;
    },
    update: async (id: number, data: PackageRequest): Promise<Package> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.PACKAGES}/${id}`, data);
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`${ENDPOINTS.ADMIN.PACKAGES}/${id}`);
    },
};
