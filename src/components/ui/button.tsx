import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "default" | "outline" | "ghost" | "success" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
    default: "border border-[var(--color-surface-soft)] bg-[var(--color-surface)] text-white hover:bg-[var(--color-surface-soft)]",
    outline: "border border-[var(--color-border-strong)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-surface)] hover:text-[var(--color-surface)]",
    ghost: "border border-[var(--color-border-strong)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-surface)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-surface)]",
    success: "border border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-soft-strong)]",
    danger: "border border-[var(--color-border-strong)] bg-[var(--color-canvas)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-canvas-strong)]",
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex h-10 cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                variants[variant],
                className,
            )}
            type={type}
            {...props}
        />
    );
}

