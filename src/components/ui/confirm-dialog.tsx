import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    /** Red destructive styling + warning icon. */
    destructive?: boolean;
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Imperative replacement for native window.confirm().
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Delete?", destructive: true })) { ... }
 */
export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
    return ctx;
}

const DEFAULT_OPTS: Required<ConfirmOptions> = {
    title: "Are you sure?",
    description: "",
    confirmText: "Continue",
    cancelText: "Cancel",
    destructive: false,
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState<Required<ConfirmOptions>>(DEFAULT_OPTS);
    const resolverRef = useRef<((v: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFn>((options) => {
        setOpts({ ...DEFAULT_OPTS, ...(options ?? {}) });
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const settle = (value: boolean) => {
        setOpen(false);
        const r = resolverRef.current;
        resolverRef.current = null;
        r?.(value);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <AlertDialog.Root open={open} onOpenChange={(o) => !o && settle(false)}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    />
                    <AlertDialog.Content
                        className={cn(
                            "fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
                            "bg-card border border-border rounded-2xl shadow-2xl p-6",
                            "data-[state=open]:animate-in data-[state=closed]:animate-out",
                            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                            "focus:outline-none",
                        )}
                    >
                        <div className="flex items-start gap-4">
                            {opts.destructive && (
                                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <AlertDialog.Title className="text-lg font-semibold text-foreground">
                                    {opts.title}
                                </AlertDialog.Title>
                                {opts.description && (
                                    <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
                                        {opts.description}
                                    </AlertDialog.Description>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <AlertDialog.Cancel
                                onClick={() => settle(false)}
                                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors"
                            >
                                {opts.cancelText}
                            </AlertDialog.Cancel>
                            <AlertDialog.Action
                                onClick={() => settle(true)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    opts.destructive
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground",
                                )}
                            >
                                {opts.confirmText}
                            </AlertDialog.Action>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </ConfirmContext.Provider>
    );
}
