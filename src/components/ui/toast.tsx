import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
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

const styles: Record<
    ToastType,
    {
        border: string;
        icon: string;
        bar: string;
        progress: string;
        Icon: typeof CheckCircle2;
    }
> = {
    success: {
        border: "border-l-[var(--color-surface)]",
        icon: "bg-emerald-50 text-[var(--color-surface)]",
        bar: "bg-[var(--color-surface)]",
        progress: "bg-[var(--color-surface)]",
        Icon: CheckCircle2,
    },
    error: {
        border: "border-l-red-600",
        icon: "bg-red-50 text-red-700",
        bar: "bg-red-600",
        progress: "bg-red-600",
        Icon: AlertCircle,
    },
    info: {
        border: "border-l-sky-600",
        icon: "bg-sky-50 text-sky-700",
        bar: "bg-sky-600",
        progress: "bg-sky-600",
        Icon: Info,
    },
    warning: {
        border: "border-l-amber-500",
        icon: "bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
        progress: "bg-amber-500",
        Icon: AlertTriangle,
    },
};

const labels: Record<ToastType, string> = {
    success: "Sucesso",
    error: "Erro",
    info: "Informação",
    warning: "Atenção",
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
                type: input.type || "info",
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
            <div className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col-reverse gap-3 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-[min(420px,calc(100vw-2rem))] sm:flex-col">
                {toasts.map((item) => {
                    const tone = styles[item.type];
                    const Icon = tone.Icon;

                    return (
                        <div
                            className={cn(
                                "pointer-events-auto relative overflow-hidden rounded-lg border border-l-4 border-[var(--color-border-strong)] bg-white p-4 pr-12 text-[var(--color-text-primary)] shadow-xl shadow-[rgba(31,41,55,0.16)]",
                                "animate-[toast-enter_180ms_var(--ease-emphasized)]",
                                tone.border,
                            )}
                            key={item.id}
                            role={item.type === "error" ? "alert" : "status"}
                        >
                            <div className={cn("absolute left-0 top-0 h-full w-1", tone.bar)} />
                            <div className="flex min-w-0 gap-3">
                                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", tone.icon)}>
                                    <Icon size={19} strokeWidth={2.3} />
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{labels[item.type]}</p>
                                    <p className="mt-0.5 text-sm font-semibold leading-5 text-[var(--color-text-primary)]">{item.title}</p>
                                    {item.description ? <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{item.description}</p> : null}
                                </div>
                            </div>
                            <button
                                aria-label="Fechar notificação"
                                className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-text-primary)]"
                                onClick={() => removeToast(item.id)}
                                type="button"
                            >
                                <X size={18} />
                            </button>
                            <div className="absolute bottom-0 left-0 h-1 w-full bg-[var(--color-canvas-strong)]">
                                <div className={cn("h-full origin-left animate-[toast-progress_5200ms_linear_forwards]", tone.progress)} />
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>
                {`
                    @keyframes toast-enter {
                        from { opacity: 0; transform: translateY(10px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }

                    @keyframes toast-progress {
                        from { transform: scaleX(1); }
                        to { transform: scaleX(0); }
                    }

                    @media (min-width: 640px) {
                        @keyframes toast-enter {
                            from { opacity: 0; transform: translateX(12px) scale(0.98); }
                            to { opacity: 1; transform: translateX(0) scale(1); }
                        }
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
