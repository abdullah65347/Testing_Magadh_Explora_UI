import { cn } from "@/lib/utils";

/** 8-spoke Dharma wheel — lucide has no equivalent. */
export function DharmaWheelIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2.2" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="5.64" y2="18.36" />
        </svg>
    );
}

interface ModeToggleProps {
    label: string;
    icon: React.ReactNode;
    active: boolean;
    /** Tailwind bg class for the ON track, e.g. "bg-amber-500". */
    trackOnClass: string;
    /** Tailwind text class for the icon accent when active, e.g. "text-amber-600". */
    accentClass: string;
    onToggle: () => void;
    fullWidth?: boolean;
}

/** iOS-style on/off switch with an icon + label. State is controlled by the parent. */
export function ModeToggle({
    label,
    icon,
    active,
    trackOnClass,
    accentClass,
    onToggle,
    fullWidth = false,
}: ModeToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={`${label} mode`}
            onClick={onToggle}
            className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                fullWidth ? "w-full justify-between" : ""
            )}
        >
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className={cn("w-4 h-4 transition-colors", active ? accentClass : "text-muted-foreground")}>
                    {icon}
                </span>
                {label}
            </span>
            <span
                className={cn(
                    "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-300",
                    active ? trackOnClass : "bg-muted-foreground/30"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300",
                        active ? "translate-x-[18px]" : "translate-x-0.5"
                    )}
                />
            </span>
        </button>
    );
}
