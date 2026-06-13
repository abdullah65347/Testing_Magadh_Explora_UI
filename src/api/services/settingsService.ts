import api from "../client";
import { ENDPOINTS } from "../endpoints";

export type SettingsMap = Record<string, string>;

export const settingsService = {
    all: async (): Promise<SettingsMap> => {
        const res = await api.get<SettingsMap>(ENDPOINTS.ADMIN.SETTINGS);
        return res.data;
    },
    save: async (changes: SettingsMap): Promise<SettingsMap> => {
        const res = await api.put<SettingsMap>(ENDPOINTS.ADMIN.SETTINGS, changes);
        return res.data;
    },
    public: async (): Promise<SettingsMap> => {
        const res = await api.get<SettingsMap>(ENDPOINTS.PUBLIC_SETTINGS);
        return res.data;
    },
};
