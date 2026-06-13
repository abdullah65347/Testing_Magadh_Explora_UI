import api from "../client";
import { ENDPOINTS } from "../endpoints";

export type TranslationMap = Record<string, string>;

export const translationService = {
    public: async (lang: string): Promise<TranslationMap> => {
        const res = await api.get<TranslationMap>(ENDPOINTS.TRANSLATIONS(lang));
        return res.data;
    },
    adminList: async (lang: string): Promise<TranslationMap> => {
        const res = await api.get<TranslationMap>(ENDPOINTS.ADMIN.TRANSLATIONS(lang));
        return res.data;
    },
    adminSave: async (lang: string, entries: TranslationMap): Promise<TranslationMap> => {
        const res = await api.put<TranslationMap>(ENDPOINTS.ADMIN.TRANSLATIONS(lang), entries);
        return res.data;
    },
    adminDelete: async (lang: string, key: string): Promise<void> => {
        await api.delete(ENDPOINTS.ADMIN.TRANSLATION_KEY(lang, key));
    },
};
