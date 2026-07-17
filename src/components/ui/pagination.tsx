import { Button } from "./button";

type PaginationProps = {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, totalItems, onPageChange }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t border-[var(--color-border-strong)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
            <span>
                Exibindo {start}-{end} de {totalItems} registros
            </span>
            <div className="flex items-center gap-2">
                <Button className="h-8 px-3" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)} variant="outline">
                    Anterior
                </Button>
                <span className="min-w-20 text-center font-medium text-[var(--color-text-primary)]">
                    {safePage} / {totalPages}
                </span>
                <Button className="h-8 px-3" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)} variant="outline">
                    Próxima
                </Button>
            </div>
        </div>
    );
}

