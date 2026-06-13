import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    captureUtmsFromUrl,
    getConsent,
    getSessionId,
    getVisitorId,
    initAnalytics,
    trackPageView,
} from "@/lib/analytics";

/**
 * Mounts inside BrowserRouter. Initializes the tracking layer once consent is
 * present, captures UTM params on the first page of the session, and fires a
 * pageview event on every route change.
 */
export default function TrackingProvider() {
    const location = useLocation();
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        captureUtmsFromUrl();
        getVisitorId();
        getSessionId();
        if (getConsent() === "granted") initAnalytics();
    }, []);

    useEffect(() => {
        const path = location.pathname + location.search;
        if (lastPath.current === path) return;
        lastPath.current = path;
        void trackPageView(path);
    }, [location.pathname, location.search]);

    return null;
}
