import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-contrast)] shadow-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-4", className)} {...props} />;
}

