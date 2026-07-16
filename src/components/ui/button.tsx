import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "default" | "outline" | "ghost" | "success" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
    default: "border border-[#00543E] bg-[#006A4E] text-white hover:bg-[#00543E]",
    outline: "border border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#006A4E] hover:text-[#006A4E]",
    ghost: "border border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#006A4E] hover:bg-[#F8F9FA] hover:text-[#006A4E]",
    success: "border border-emerald-200 bg-emerald-50 text-[#10B981] hover:bg-emerald-100",
    danger: "border border-red-200 bg-red-50 text-[#EF4444] hover:bg-red-100",
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
