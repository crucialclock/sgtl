import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ConfirmDialog } from "../components/ui/layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { backupsService, type BackupInfo } from "../services/backups-service";

const PAGE_SIZE = 5;

export function BackupsPage() {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingFileName, setDeletingFileName] = useState<string | null>(null);
    const [confirmBackup, setConfirmBackup] = useState<BackupInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const totalPages = Math.max(1, Math.ceil(backups.length / PAGE_SIZE));
    const visibleBackups = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return backups.slice(start, start + PAGE_SIZE);
    }, [backups, currentPage]);
    const pageStart = backups.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const pageEnd = Math.min(currentPage * PAGE_SIZE, backups.length);

    useEffect(() => {
        void loadBackups();
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    async function loadBackups() {
        setIsLoading(true);
        try {
            setBackups(await backupsService.list());
        } catch (error) {
            toast({ title: "Erro ao carregar backups", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    async function createBackup() {
        setIsCreating(true);
        try {
            await backupsService.create();
            await loadBackups();
            setCurrentPage(1);
            toast({ title: "Backup criado", description: "O arquivo SQLite foi salvo no servidor.", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao criar backup", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsCreating(false);
        }
    }

    async function downloadBackup(fileName: string) {
        try {
            const blob = await backupsService.download(fileName);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast({ title: "Erro ao baixar backup", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function deleteBackup() {
        if (!confirmBackup) {
            return;
        }

        const fileName = confirmBackup.fileName;
        setDeletingFileName(fileName);
        try {
            await backupsService.delete(fileName);
            setConfirmBackup(null);
            await loadBackups();
            toast({ title: "Backup excluído", description: "O arquivo foi removido do servidor.", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao excluir backup", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setDeletingFileName(null);
        }
    }

    return (
        <section className="space-y-4">
            <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#1F2937]">Backup do banco SQLite</p>
                        <p className="mt-1 text-sm text-[#4B5563]">
                            Crie um backup manual quando quiser. Backups automáticos são gerados pela API conforme a configuração do servidor.
                        </p>
                    </div>
                    <Button disabled={isCreating} onClick={createBackup}>
                        {isCreating ? "Criando..." : "Criar backup"}
                    </Button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="border-b border-[#D1D5DB] bg-[#F8F9FA] px-4 py-3">
                    <p className="text-sm font-semibold text-[#1F2937]">Backups disponíveis</p>
                    <p className="text-xs text-[#4B5563]">Arquivos salvos no servidor da API.</p>
                </div>
                <div className="overflow-x-auto">
                    <Table className="min-w-190">
                        <TableHead>
                            <TableRow className="border-t-0">
                                <TableHeader>Arquivo</TableHeader>
                                <TableHeader>Criado em</TableHeader>
                                <TableHeader>Tamanho</TableHeader>
                                <TableHeader>Ações</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-[#4B5563]">Carregando backups...</TableCell></TableRow> : null}
                            {!isLoading && backups.length === 0 ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-[#4B5563]">Nenhum backup encontrado.</TableCell></TableRow> : null}
                            {!isLoading && visibleBackups.map((backup) => (
                                <TableRow key={backup.fileName}>
                                    <TableCell className="font-medium text-[#1F2937]">{backup.fileName}</TableCell>
                                    <TableCell>{formatDateTime(backup.createdAt)}</TableCell>
                                    <TableCell>{formatSize(backup.size)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            <Button className="h-8 w-24 px-3" variant="outline" onClick={() => downloadBackup(backup.fileName)}>Baixar</Button>
                                            <Button
                                                className="h-8 w-24 px-3"
                                                variant="danger"
                                                disabled={deletingFileName === backup.fileName}
                                                onClick={() => setConfirmBackup(backup)}
                                            >
                                                {deletingFileName === backup.fileName ? "Excluindo..." : "Excluir"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {!isLoading && backups.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-[#D1D5DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#4B5563]">
                            Mostrando {pageStart} a {pageEnd} de {backups.length} backups
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                className="h-9 px-3"
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            >
                                Anterior
                            </Button>
                            <span className="min-w-20 text-center text-sm font-medium text-[#1F2937]">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                className="h-9 px-3"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Card>

            <ConfirmDialog
                open={Boolean(confirmBackup)}
                title="Excluir backup"
                description={`Confirma a exclusão do backup ${confirmBackup?.fileName ?? "selecionado"}? Essa ação remove o arquivo do servidor.`}
                confirmLabel="Excluir"
                onCancel={() => setConfirmBackup(null)}
                onConfirm={deleteBackup}
            />
        </section>
    );
}

function formatSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}
