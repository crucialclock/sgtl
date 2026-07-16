import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "../../lib/cn";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
    id: number;
    title: string;
    description?: string;
    type: ToastType;
};

type ToastInput = {
    title: string;
    description?: string;
    type?: ToastType;
};

type ToastContextValue = {
    toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 5200;

const styles: Record<ToastType, string> = {
    success: "border-emerald-200 bg-emerald-50 text-[#065F46]",
    error: "border-red-200 bg-red-50 text-[#991B1B]",
    info: "border-blue-200 bg-blue-50 text-[#1E40AF]",
    warning: "border-amber-200 bg-amber-50 text-[#92400E]",
};

const progressStyles: Record<ToastType, string> = {
    success: "bg-[#10B981]",
    error: "bg-[#EF4444]",
    info: "bg-[#3B82F6]",
    warning: "bg-[#F59E0B]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    }, []);

    const toast = useCallback(
        (input: ToastInput) => {
            const id = Date.now() + Math.random();
            const nextToast: Toast = {
                id,
                title: input.title,
                description: input.description,
                type: input.type ?? "info",
            };

            setToasts((current) => [nextToast, ...current].slice(0, 4));
            window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
        },
        [removeToast],
    );

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed right-4 top-4 z-50 flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
                {toasts.map((item) => (
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-lg border p-4 pr-12 shadow-lg shadow-slate-900/10",
                            styles[item.type],
                        )}
                        key={item.id}
                    >
                        <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            {item.description && <p className="mt-1 text-sm opacity-80">{item.description}</p>}
                            <button
                                aria-label="Fechar notificacao"
                                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-current bg-white/40 text-base font-semibold leading-none opacity-70 transition-opacity hover:opacity-100"
                                onClick={() => removeToast(item.id)}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10">
                            <div
                                className={cn("h-full origin-left animate-[toast-progress_5200ms_linear_forwards]", progressStyles[item.type])}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <style>
                {`
                    @keyframes toast-progress {
                        from { transform: scaleX(1); }
                        to { transform: scaleX(0); }
                    }
                `}
            </style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast deve ser usado dentro de ToastProvider.");
    }

    return context;
}
