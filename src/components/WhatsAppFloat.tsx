import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { settingsService } from "@/api/services/settingsService";
import { track } from "@/lib/analytics";

const DEFAULT_MESSAGE = "Hi, I'm interested in your Bihar tours.";

/** Official-looking WhatsApp glyph — lucide doesn't ship a brand mark. */
function WhatsAppGlyph({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M16.001 3.2C9.04 3.2 3.4 8.84 3.4 15.8c0 2.225.583 4.394 1.692 6.305L3.2 28.8l6.85-1.794a12.55 12.55 0 0 0 5.95 1.515h.005c6.96 0 12.6-5.64 12.6-12.6 0-3.367-1.31-6.532-3.692-8.913A12.51 12.51 0 0 0 16.001 3.2Zm0 22.92h-.004a10.46 10.46 0 0 1-5.328-1.46l-.382-.226-3.97 1.04 1.06-3.866-.249-.397a10.43 10.43 0 0 1-1.599-5.61c0-5.78 4.706-10.485 10.487-10.485 2.8 0 5.43 1.092 7.408 3.07a10.41 10.41 0 0 1 3.07 7.42c0 5.78-4.706 10.514-10.493 10.514Zm5.752-7.851c-.315-.158-1.865-.92-2.153-1.025-.289-.105-.5-.158-.71.158-.21.315-.815 1.025-1 1.236-.184.21-.368.236-.683.078-.315-.158-1.33-.49-2.534-1.563-.937-.836-1.57-1.868-1.755-2.183-.184-.315-.02-.485.138-.642.142-.141.315-.368.473-.552.158-.184.21-.315.315-.525.105-.21.053-.394-.026-.552-.079-.158-.71-1.713-.973-2.347-.256-.616-.516-.532-.71-.542l-.604-.011c-.21 0-.552.079-.84.394-.289.315-1.103 1.078-1.103 2.63 0 1.552 1.129 3.052 1.287 3.262.158.21 2.223 3.394 5.385 4.76.752.325 1.339.519 1.796.664.755.24 1.442.206 1.986.125.606-.09 1.865-.762 2.128-1.498.263-.736.263-1.367.184-1.498-.079-.131-.289-.21-.604-.368Z" />
        </svg>
    );
}

export function WhatsAppFloat() {
    const location = useLocation();
    const q = useQuery({
        queryKey: ["public", "settings"],
        queryFn: settingsService.public,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    // Hide inside admin so it doesn't cover the admin UI
    if (location.pathname.startsWith("/admin")) return null;
    if (q.isLoading || !q.data) return null;

    const enabled = q.data["whatsapp.enabled"] === "true";
    const rawNumber = (q.data["whatsapp.number"] ?? "").replace(/\D/g, "");
    if (!enabled || rawNumber.length < 6) return null;

    const message = q.data["whatsapp.default_message"]?.trim() || DEFAULT_MESSAGE;
    const href = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() => void track({ eventType: "whatsapp_click", properties: { from: location.pathname } })}
            className="fixed bottom-5 right-5 z-50 group"
        >
            <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping pointer-events-none" />
            <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 group-hover:scale-105 group-active:scale-95 transition-transform">
                <WhatsAppGlyph className="w-7 h-7" />
            </span>
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden md:block">
                Chat on WhatsApp
            </span>
        </a>
    );
}
