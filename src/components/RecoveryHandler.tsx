import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    abandonedLeadService,
    type AbandonedLeadDto,
} from "@/api/services/abandonedLeadService";

interface Props {
    onOpenQuote: (prefill: { name?: string; email?: string; phone?: string }) => void;
}

/**
 * Watches for a `?recovery=<token>` query param (set when a user clicks a recovery
 * email link). Resolves the abandoned lead and routes them back into the right
 * form pre-filled, then strips the param from the URL.
 *
 * Sources we handle today:
 *   - quote-modal           → open global QuoteModal with prefill
 *   - contact-page          → navigate to /contact with prefill in router state
 *   - book-now-modal        → fall back to QuoteModal (package context lost)
 *   - package-detail-quote  → fall back to QuoteModal
 */
export function RecoveryHandler({ onOpenQuote }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const handledTokenRef = useRef<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("recovery");
        if (!token) return;
        if (handledTokenRef.current === token) return;
        handledTokenRef.current = token;

        let cancelled = false;
        abandonedLeadService
            .resolve(token)
            .then((lead: AbandonedLeadDto) => {
                if (cancelled) return;

                const prefill = {
                    name: lead.name || undefined,
                    email: lead.email || undefined,
                    phone: lead.mobile || undefined,
                };
                const greeting = lead.name ? `Welcome back, ${lead.name.split(" ")[0]}` : "Welcome back";

                // Strip the recovery param so a reload doesn't re-trigger.
                params.delete("recovery");
                const cleanSearch = params.toString();

                switch (lead.source) {
                    case "contact-page":
                        navigate(
                            { pathname: "/contact", search: cleanSearch ? `?${cleanSearch}` : "" },
                            { state: { recoveryPrefill: prefill }, replace: true },
                        );
                        break;
                    case "quote-modal":
                    case "book-now-modal":
                    case "package-detail-quote":
                    default:
                        navigate(
                            { pathname: location.pathname, search: cleanSearch ? `?${cleanSearch}` : "" },
                            { replace: true },
                        );
                        onOpenQuote(prefill);
                        break;
                }

                toast.success(greeting, {
                    description: "We saved your details — pick up where you left off.",
                });
            })
            .catch(() => {
                // Token expired or invalid — strip it silently so we don't loop.
                params.delete("recovery");
                const cleanSearch = params.toString();
                navigate(
                    { pathname: location.pathname, search: cleanSearch ? `?${cleanSearch}` : "" },
                    { replace: true },
                );
            });

        return () => {
            cancelled = true;
        };
    }, [location.pathname, location.search, navigate, onOpenQuote]);

    return null;
}
