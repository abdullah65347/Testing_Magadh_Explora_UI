export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        ME: "/api/auth/me",
    },
    PACKAGES: {
        LIST: "/api/packages",
        DETAIL: (id: string | number) => `/api/packages/${id}`,
    },
    DESTINATIONS: {
        LIST: "/api/destinations",
        DETAIL: (id: string | number) => `/api/destinations/${id}`,
    },
    BLOGS: {
        LIST: "/api/blogs",
        DETAIL: (id: string | number) => `/api/blogs/${id}`,
    },
    CATEGORIES: { LIST: "/api/categories" },
    HOMEPAGE: "/api/homepage",
    GEO: "/api/geo",
    TRANSLATIONS: (lang: string) => `/api/translations/${lang}`,
    PUBLIC_CURRENCY: "/api/public/currency",
    PUBLIC_SETTINGS: "/api/public/settings",
    CONTACT: "/api/contact",
    QUOTE: "/api/quote",
    BOOKING: "/api/bookings",
    ABANDONED_RECOVERY: (token: string) =>
        `/api/leads/abandoned/recovery/${encodeURIComponent(token)}`,
    ADMIN: {
        SETTINGS: "/api/admin/settings",
        PACKAGES: "/api/admin/packages",
        DESTINATIONS: "/api/admin/destinations",
        BLOGS: "/api/admin/blogs",
        CATEGORIES: "/api/admin/categories",
        CONTACTS: "/api/admin/contacts",
        QUOTES: "/api/admin/quotes",
        BOOKINGS: "/api/admin/bookings",
        HOMEPAGE: "/api/admin/homepage",
        UPLOADS: "/api/admin/uploads",
        CURRENCY_REFRESH: "/api/admin/currency/refresh",
        TRANSLATIONS: (lang: string) => `/api/admin/translations/${lang}`,
        TRANSLATION_KEY: (lang: string, key: string) =>
            `/api/admin/translations/${lang}/${encodeURIComponent(key)}`,
    },
};