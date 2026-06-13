import api from "@/api/client";
import { GA4_MEASUREMENT_ID, META_PIXEL_ID, CLARITY_ID } from "@/config/env";

const VISITOR_COOKIE = "mx_vid";
const SESSION_KEY = "mx_sid";
const SESSION_START_KEY = "mx_sid_started";
const UTM_KEY = "mx_utm";
const CONSENT_KEY = "mx_consent";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const VISITOR_TTL_DAYS = 730;

export type ConsentChoice = "granted" | "declined";

export interface UtmParams {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
}

let scriptsLoaded = false;
let currentSessionId = "";

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
        clarity?: (...args: unknown[]) => void;
    }
}

export function getConsent(): ConsentChoice | null {
    try {
        const v = localStorage.getItem(CONSENT_KEY);
        return v === "granted" || v === "declined" ? v : null;
    } catch {
        return null;
    }
}

export function setConsent(choice: ConsentChoice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch { /* ignore */ }
    if (choice === "granted") initAnalytics();
}

function uuid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getVisitorId(): string {
    let id = readCookie(VISITOR_COOKIE);
    if (!id) {
        id = uuid();
        writeCookie(VISITOR_COOKIE, id, VISITOR_TTL_DAYS);
    }
    return id;
}

export function getSessionId(): string {
    try {
        const startedAt = Number(sessionStorage.getItem(SESSION_START_KEY) || "0");
        const existing = sessionStorage.getItem(SESSION_KEY);
        const now = Date.now();
        if (existing && now - startedAt < SESSION_IDLE_MS) {
            sessionStorage.setItem(SESSION_START_KEY, String(now));
            currentSessionId = existing;
            return existing;
        }
        const fresh = uuid();
        sessionStorage.setItem(SESSION_KEY, fresh);
        sessionStorage.setItem(SESSION_START_KEY, String(now));
        currentSessionId = fresh;
        return fresh;
    } catch {
        if (!currentSessionId) currentSessionId = uuid();
        return currentSessionId;
    }
}

export function captureUtmsFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const utm: UtmParams = {};
        const map: Array<[keyof UtmParams, string]> = [
            ["utmSource", "utm_source"],
            ["utmMedium", "utm_medium"],
            ["utmCampaign", "utm_campaign"],
            ["utmTerm", "utm_term"],
            ["utmContent", "utm_content"],
        ];
        let found = false;
        for (const [k, q] of map) {
            const v = params.get(q);
            if (v) { utm[k] = v; found = true; }
        }
        if (found) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    } catch { /* ignore */ }
}

function readStoredUtms(): UtmParams {
    try {
        const raw = sessionStorage.getItem(UTM_KEY);
        return raw ? (JSON.parse(raw) as UtmParams) : {};
    } catch {
        return {};
    }
}

function detectDevice(): { device: string; os: string; browser: string } {
    const ua = navigator.userAgent;
    const device = /Mobi|Android|iPhone|iPad|iPod/.test(ua)
        ? (/iPad|Tablet/.test(ua) ? "tablet" : "mobile")
        : "desktop";
    const os =
        /Windows/.test(ua) ? "Windows" :
        /Android/.test(ua) ? "Android" :
        /iPhone|iPad|iPod/.test(ua) ? "iOS" :
        /Mac OS X|Macintosh/.test(ua) ? "macOS" :
        /Linux/.test(ua) ? "Linux" : "Other";
    const browser =
        /Edg\//.test(ua) ? "Edge" :
        /Chrome\//.test(ua) ? "Chrome" :
        /Firefox\//.test(ua) ? "Firefox" :
        /Safari\//.test(ua) ? "Safari" : "Other";
    return { device, os, browser };
}

function loadScript(src: string, id: string): Promise<void> {
    return new Promise((resolve) => {
        if (document.getElementById(id)) { resolve(); return; }
        const s = document.createElement("script");
        s.src = src; s.async = true; s.id = id;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
    });
}

function initGa4() {
    if (!GA4_MEASUREMENT_ID) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) { window.dataLayer!.push(args); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID, { anonymize_ip: true });
    void loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`, "ga4-script");
}

function initMetaPixel() {
    if (!META_PIXEL_ID) return;
    if (window.fbq) return;
    const n: typeof window.fbq = function (...args: unknown[]) {
        const f = n as unknown as { callMethod?: (...a: unknown[]) => void; queue?: unknown[] };
        if (f.callMethod) f.callMethod(...args);
        else (f.queue = f.queue || []).push(args);
    } as typeof window.fbq;
    window.fbq = n;
    void loadScript("https://connect.facebook.net/en_US/fbevents.js", "fb-pixel-script").then(() => {
        window.fbq?.("init", META_PIXEL_ID);
        window.fbq?.("track", "PageView");
    });
}

function initClarity() {
    if (!CLARITY_ID) return;
    if (document.getElementById("clarity-script")) return;
    const s = document.createElement("script");
    s.id = "clarity-script";
    s.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`;
    document.head.appendChild(s);
}

export function initAnalytics() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;
    initGa4();
    initMetaPixel();
    initClarity();
}

interface TrackPayload {
    eventType: string;
    path?: string;
    properties?: Record<string, unknown>;
}

export async function track({ eventType, path, properties }: TrackPayload) {
    if (getConsent() !== "granted") return;
    const utm = readStoredUtms();
    const { device, os, browser } = detectDevice();
    const body = {
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        eventType,
        path: path ?? window.location.pathname,
        referrer: document.referrer || undefined,
        device, os, browser,
        language: navigator.language,
        ...utm,
        properties: properties ? JSON.stringify(properties) : undefined,
    };
    try {
        await api.post("/api/track/event", body);
    } catch { /* swallow — tracking must never break UX */ }

    if (eventType === "pageview") {
        window.gtag?.("event", "page_view", { page_path: body.path });
        window.fbq?.("track", "PageView");
    } else {
        window.gtag?.("event", eventType, properties || {});
    }
}

export function trackPageView(path?: string) {
    return track({ eventType: "pageview", path });
}
