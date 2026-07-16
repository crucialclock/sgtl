import { ReactNode, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { cn } from "../../lib/cn";

export function Field({
    label,
    children,
    className = "",
    helper,
    error,
}: {
    label: string;
    children: ReactNode;
    className?: string;
    helper?: string;
    error?: string;
}) {
    return (
        <label className={cn("block", className)}>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#4B5563]">{label}</span>
            {children}
            {error ? <span className="mt-1 block text-xs font-medium text-[#EF4444]">{error}</span> : null}
            {!error && helper ? <span className="mt-1 block text-xs text-[#6B7280]">{helper}</span> : null}
        </label>
    );
}

export function FormSection({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
    return (
        <fieldset className={cn("rounded-lg border border-[#D1D5DB] bg-[#F8F9FA] p-4", className)}>
            <legend className="px-1 text-sm font-semibold text-[#1F2937]">{title}</legend>
            <div className="mt-2 grid gap-4 md:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export function FilterBar({ children }: { children: ReactNode }) {
    return <div className="grid gap-3 border-b border-[#D1D5DB] bg-[#F8F9FA] p-4 md:grid-cols-4">{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className="py-10 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">{title}</p>
            {description ? <p className="mt-1 text-sm text-[#4B5563]">{description}</p> : null}
        </div>
    );
}

export function StatusBadge({ tone = "neutral", children }: { tone?: "success" | "danger" | "info" | "neutral"; children: ReactNode }) {
    const tones = {
        success: "bg-emerald-50 text-[#047857]",
        danger: "bg-red-50 text-[#B91C1C]",
        info: "bg-blue-50 text-[#1D4ED8]",
        neutral: "bg-slate-100 text-[#4B5563]",
    };

    return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], tone === "success" && "border-emerald-200", tone === "danger" && "border-red-200", tone === "info" && "border-blue-200", tone === "neutral" && "border-slate-200")}>{children}</span>;
}

export function Modal({
    open,
    title,
    description,
    children,
    onClose,
    size = "md",
}: {
    open: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
    size?: "md" | "lg";
}) {
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, open]);

    if (!open) return null;

    const sizeClass = size === "lg" ? "max-w-4xl" : "max-w-3xl";

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
            <div className={cn("max-h-[92vh] w-full overflow-y-auto rounded-lg border border-[#D1D5DB] bg-white shadow-2xl shadow-slate-900/20", sizeClass)} onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 border-b border-[#D1D5DB] bg-[#F8F9FA] px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
                        {description ? <p className="mt-1 text-sm text-[#4B5563]">{description}</p> : null}
                    </div>
                    <Button variant="ghost" className="h-8 px-2" onClick={onClose}>Fechar</Button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirmar",
    onCancel,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onCancel();
            }
            if (event.key === "Enter") {
                onConfirm();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onCancel, onConfirm, open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onCancel}>
            <Card className="w-full max-w-md p-5" onMouseDown={(event) => event.stopPropagation()}>
                <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
                <p className="mt-2 text-sm text-[#4B5563]">{description}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </Card>
        </div>
    );
}
