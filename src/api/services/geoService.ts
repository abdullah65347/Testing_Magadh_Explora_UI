import api from "../client";
import { ENDPOINTS } from "../endpoints";

export interface GeoInfo {
    ip: string;
    countryCode: string;
    country: string;
    currency: string;
    suggestedLang: string;
}

export const geoService = {
    lookup: async (): Promise<GeoInfo> => {
        const res = await api.get(ENDPOINTS.GEO);
        return res.data;
    },
};
