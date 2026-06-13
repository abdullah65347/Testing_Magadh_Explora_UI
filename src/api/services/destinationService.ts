import api from "../client";
import { ENDPOINTS } from "../endpoints";

export interface Destination {
    id: number;
    slug: string;
    name: string;
    region?: string;
    description?: string;
    heroImageUrl?: string;
    latitude?: number;
    longitude?: number;
    active: boolean;
}

export type DestinationInput = Omit<Destination, "id">;

export const destinationService = {
    list: async (lang?: string): Promise<Destination[]> => {
        const res = await api.get(ENDPOINTS.DESTINATIONS.LIST, {
            params: lang ? { lang } : undefined,
        });
        return res.data;
    },
    adminList: async (): Promise<Destination[]> => {
        const res = await api.get(ENDPOINTS.ADMIN.DESTINATIONS);
        return res.data;
    },
    get: async (slug: string, lang?: string): Promise<Destination> => {
        const res = await api.get(ENDPOINTS.DESTINATIONS.DETAIL(slug), {
            params: lang ? { lang } : undefined,
        });
        return res.data;
    },
    create: async (data: DestinationInput): Promise<Destination> => {
        const res = await api.post(ENDPOINTS.ADMIN.DESTINATIONS, data);
        return res.data;
    },
    update: async (id: number, data: DestinationInput): Promise<Destination> => {
        const res = await api.put(`${ENDPOINTS.ADMIN.DESTINATIONS}/${id}`, data);
        return res.data;
    },
    remove: async (id: number): Promise<void> => {
        await api.delete(`${ENDPOINTS.ADMIN.DESTINATIONS}/${id}`);
    },
};
