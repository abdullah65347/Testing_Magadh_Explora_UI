import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { API_BASE_URL } from "@/config/env";

/** Uploads a single image file and returns the public URL (absolute). */
export const uploadService = {
    upload: async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post<{ url: string }>(ENDPOINTS.ADMIN.UPLOADS, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const path = res.data.url;
        // Backend returns a path like "/uploads/2026/05/xxx.jpg" — make it absolute
        return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    },
};
