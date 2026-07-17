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
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</span>
            {children}
            {error ? <span className="mt-1 block text-xs font-medium text-[var(--color-accent-contrast)]">{error}</span> : null}
            {!error && helper ? <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{helper}</span> : null}
        </label>
    );
}

export function FormSection({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
    return (
        <fieldset className={cn("rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-canvas)] p-4", className)}>
            <legend className="px-1 text-sm font-semibold text-[var(--color-text-primary)]">{title}</legend>
            <div className="mt-2 grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export function FilterBar({ children }: { children: ReactNode }) {
    return <div className="grid min-w-0 gap-3 border-b border-[var(--color-border-strong)] bg-[var(--color-canvas)] p-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className="py-10 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
            {description ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
        </div>
    );
}

export function StatusBadge({ tone = "neutral", children }: { tone?: "success" | "danger" | "info" | "neutral"; children: ReactNode }) {
    const tones = {
        success: "border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] text-[var(--color-surface)]",
        danger: "border-[var(--color-border-strong)] bg-[var(--color-canvas)] text-[var(--color-accent-contrast)]",
        info: "border-[var(--color-border-soft)] bg-[var(--color-canvas)] text-[var(--color-surface-soft)]",
        neutral: "border-[var(--color-border-soft)] bg-[var(--color-canvas-strong)] text-[var(--color-text-secondary)]",
    };

    return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
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
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(45,50,56,0.35)] p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
            <div className={cn("max-h-[94vh] w-full overflow-y-auto rounded-t-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-contrast)] shadow-2xl shadow-[rgba(45,50,56,0.16)] sm:max-h-[92vh] sm:rounded-lg", sizeClass)} onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex flex-col gap-3 border-b border-[var(--color-border-strong)] bg-[var(--color-canvas)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
                        {description ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
                    </div>
                    <Button variant="ghost" className="min-h-10 w-full px-3 sm:w-auto" onClick={onClose}>Fechar</Button>
                </div>
                <div className="min-w-0 p-4 sm:p-5">{children}</div>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(45,50,56,0.35)] p-0 sm:items-center sm:p-4" onMouseDown={onCancel}>
            <Card className="w-full max-w-md p-5" onMouseDown={(event) => event.stopPropagation()}>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </Card>
        </div>
    );
}


