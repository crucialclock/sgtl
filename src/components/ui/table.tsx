import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
    return <table className={cn("w-full border-collapse border border-border-strong text-left text-sm", className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("bg-canvas text-text-secondary", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
    return <tr className={cn("border border-border-strong transition-colors hover:bg-canvas", className)} {...props} />;
}

export function TableHeader({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
    return <th className={cn("border border-border-strong px-4 py-3 text-xs font-semibold uppercase tracking-wide", className)} {...props} />;
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={cn("border border-border-strong px-4 py-3 align-middle", className)} {...props} />;
}
