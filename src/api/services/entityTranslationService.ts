import api from "../client";

export type EntityTranslatableType = "package" | "destination";

export const entityTranslationService = {
    get: async (
        type: EntityTranslatableType,
        id: number,
        lang: string
    ): Promise<Record<string, string>> => {
        const res = await api.get(`/api/admin/translations/entity/${type}/${id}/${lang}`);
        return res.data ?? {};
    },
    put: async (
        type: EntityTranslatableType,
        id: number,
        lang: string,
        fields: Record<string, string>
    ): Promise<Record<string, string>> => {
        const res = await api.put(`/api/admin/translations/entity/${type}/${id}/${lang}`, fields);
        return res.data ?? {};
    },
};
