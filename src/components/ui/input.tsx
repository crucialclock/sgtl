import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/10 disabled:cursor-not-allowed disabled:bg-[#F8F9FA]",
                className,
            )}
            {...props}
        />
    );
}
