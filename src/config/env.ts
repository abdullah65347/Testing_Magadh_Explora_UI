// Use `??` (not `||`) so an explicit empty value means "same origin / relative"
// — needed when sharing via a tunnel where the API is proxied by Vite/nginx.
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const BACKEND_BASE_URL = API_BASE_URL;

export const GA4_MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) || "";
export const META_PIXEL_ID      = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || "";
export const CLARITY_ID         = (import.meta.env.VITE_CLARITY_ID as string | undefined) || "";