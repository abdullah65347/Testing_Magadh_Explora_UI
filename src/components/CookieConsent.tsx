import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (getConsent() === null) setVisible(true);
    }, []);

    if (!visible) return null;

    const accept = () => { setConsent("granted"); setVisible(false); };
    const decline = () => { setConsent("declined"); setVisible(false); };

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] bg-card text-foreground border border-border rounded-xl shadow-xl p-5"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">We value your privacy</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        We use cookies to understand how you use our site and to improve your experience.
                        This includes anonymous analytics. We comply with the DPDP Act and GDPR — you can
                        decline without affecting site functionality.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <button
                            onClick={accept}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                        >
                            Accept all
                        </button>
                        <button
                            onClick={decline}
                            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                            Decline
                        </button>
                    </div>
                </div>
                <button
                    onClick={decline}
                    aria-label="Dismiss"
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
