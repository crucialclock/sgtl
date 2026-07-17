import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                "h-10 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-contrast)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-surface)]/10",
                className,
            )}
            {...props}
        />
    );
}

