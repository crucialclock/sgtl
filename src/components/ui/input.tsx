import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "min-h-11 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-contrast)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-surface)]/10 disabled:cursor-not-allowed disabled:bg-[var(--color-canvas)]",
                className,
            )}
            {...props}
        />
    );
}

