import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                "h-10 rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition-colors focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/10",
                className,
            )}
            {...props}
        />
    );
}
