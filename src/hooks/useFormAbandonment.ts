import { useEffect, useRef, useCallback } from "react";
import {
    abandonedLeadService,
    type AbandonedLeadSource,
} from "@/api/services/abandonedLeadService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDLE_MS = 60_000;

interface Options<T extends object> {
    source: AbandonedLeadSource;
    formState: T & { email?: string; name?: string; phone?: string; mobile?: string };
    submitted?: boolean;
    /**
     * When this transitions `true` → `false` (modal close, etc.) we treat that as
     * the abandonment moment and fire. When it goes back `false` → `true` (modal
     * re-opens) the single-shot flag resets.
     */
    enabled?: boolean;
}

/**
 * Captures form-abandonment leads.
 *
 *   - Fires when `enabled` flips true → false (modal closes)
 *   - Fires when component unmounts
 *   - Fires on window `beforeunload`
 *   - Fires after 60s of no keystrokes
 *
 * Captures when EITHER a valid email OR a non-empty mobile is present.
 */
export function useFormAbandonment<T extends object>({
    source,
    formState,
    submitted = false,
    enabled = true,
}: Options<T>): void {
    const stateRef = useRef(formState);
    const submittedRef = useRef(submitted);
    const prevEnabledRef = useRef(enabled);
    const idleTimerRef = useRef<number | null>(null);
    const firedRef = useRef(false);

    stateRef.current = formState;
    submittedRef.current = submitted;

    const buildPayload = useCallback(() => {
        const s = stateRef.current;
        const email = (s.email ?? "").trim();
        const phone = ((s.phone ?? s.mobile) ?? "").trim();
        const name = (s.name ?? "").trim();

        const hasEmail = EMAIL_RE.test(email);
        const hasPhone = phone.length > 0;
        if (!hasEmail && !hasPhone) return null;
        if (submittedRef.current) return null;

        const extras: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s)) {
            if (k === "email" || k === "name" || k === "phone" || k === "mobile") continue;
            if (v === undefined || v === null || v === "") continue;
            extras[k] = v;
        }

        return {
            source,
            email: hasEmail ? email : undefined,
            name: name || undefined,
            mobile: hasPhone ? phone : undefined,
            formState: Object.keys(extras).length > 0 ? JSON.stringify(extras) : undefined,
        };
    }, [source]);

    /** Fire does NOT gate on `enabled` — callers decide when to fire. Single-shot. */
    const fire = useCallback((useBeacon: boolean) => {
        if (firedRef.current) return;
        const payload = buildPayload();
        if (!payload) return;
        firedRef.current = true;
        abandonedLeadService.capture(payload, useBeacon);
    }, [buildPayload]);

    // Transition: enabled true → false  ⇒ FIRE.   false → true ⇒ reset single-shot.
    useEffect(() => {
        if (enabled && !prevEnabledRef.current) {
            firedRef.current = false;
        }
        if (prevEnabledRef.current && !enabled) {
            fire(false);
        }
        prevEnabledRef.current = enabled;
    }, [enabled, fire]);

    // beforeunload — only attach when enabled
    useEffect(() => {
        if (!enabled) return;
        const handler = () => fire(true);
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [enabled, fire]);

    // Idle timer — only run while enabled
    useEffect(() => {
        if (!enabled) return;
        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => fire(false), IDLE_MS);
        return () => {
            if (idleTimerRef.current) {
                window.clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
        };
    }, [formState, enabled, fire]);

    // Unmount — last-chance capture
    useEffect(() => {
        return () => {
            fire(false);
        };
    }, [fire]);
}
