import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, DollarSign, FileText, Truck, UserRound, Wrench } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ConfirmDialog, Field, FilterBar, FormSection, Modal } from "../components/ui/layout";
import { Pagination } from "../components/ui/pagination";
import { Select } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { exportMaintenancesPdf } from "../lib/vehicle-events-pdf";
import { driversService } from "../services/drivers-service";
import { maintenancesService, type MaintenanceInput } from "../services/maintenances-service";
import { vehiclesService } from "../services/vehicles-service";
import type { Driver, Maintenance, Vehicle } from "../types/operations";

const today = new Date().toISOString().slice(0, 10);
const pageSize = 5;
const maintenanceTypes = ["Preventiva", "Corretiva", "Pneus", "Óleo e filtros", "Freios", "Elétrica", "Documentação", "Revisão geral"];
const emptyForm: MaintenanceInput = { tipo: maintenanceTypes[0], data: today, valor: 0, responsavel: "", observacoes: "", vehicleId: 0, employeeId: 0 };

export function MaintenancesPage() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [employees, setEmployees] = useState<Driver[]>([]);
    const [form, setForm] = useState<MaintenanceInput>(emptyForm);
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [removing, setRemoving] = useState<Maintenance | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const { toast } = useToast();

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return maintenances.filter((item) => {
            const matchesSearch = !term || `${item.vehicleLabel || ""} ${item.tipo} ${item.employeeName || ""} ${item.responsavel} ${item.observacoes}`.toLowerCase().includes(term);
            const matchesVehicle = vehicleFilter === "all" || item.vehicleId === Number(vehicleFilter);
            const matchesType = typeFilter === "all" || item.tipo === typeFilter;
            return matchesSearch && matchesVehicle && matchesType;
        });
    }, [maintenances, search, vehicleFilter, typeFilter]);

    const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => { void loadAll(); }, []);
    useEffect(() => setPage(1), [search, vehicleFilter, typeFilter]);

    async function loadAll() {
        setIsLoading(true);
        try {
            const [nextMaintenances, nextVehicles, nextEmployees] = await Promise.all([maintenancesService.list(), vehiclesService.list(), driversService.list()]);
            setMaintenances(nextMaintenances);
            setVehicles(nextVehicles);
            setEmployees(nextEmployees);
        } catch (error) {
            toast({ title: "Erro ao carregar manutenções", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    }

    function openEdit(item: Maintenance) {
        setEditing(item);
        setForm({ tipo: item.tipo, data: item.data, valor: item.valor, responsavel: item.responsavel, observacoes: item.observacoes, vehicleId: item.vehicleId, employeeId: item.employeeId });
        setIsModalOpen(true);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const employee = employees.find((item) => item.id === form.employeeId);
        const payload = { ...form, responsavel: employee?.nome || form.responsavel };

        try {
            if (editing) {
                await maintenancesService.update(editing.id, payload);
                toast({ title: "Manutenção atualizada", type: "success" });
            } else {
                await maintenancesService.create(payload);
                toast({ title: "Manutenção registrada", type: "success" });
            }
            setIsModalOpen(false);
            await loadAll();
        } catch (error) {
            toast({ title: "Erro ao salvar manutenção", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function confirmRemove() {
        if (!removing) return;
        try {
            await maintenancesService.remove(removing.id);
            setRemoving(null);
            await loadAll();
            toast({ title: "Manutenção removida", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao remover manutenção", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function exportPdf() {
        if (filtered.length === 0) {
            toast({ title: "Nada para exportar", type: "warning" });
            return;
        }

        const saved = await exportMaintenancesPdf(filtered);
        if (saved) toast({ title: "PDF salvo", type: "success" });
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">Registre manutenções vinculadas aos veículos da frota.</p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={exportPdf}>Exportar PDF</Button>
                    <Button onClick={openCreate}>Nova manutenção</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <FilterBar>
                    <Field label="Busca" className="md:col-span-2">
                        <Input placeholder="Tipo, veículo, funcionário ou observação" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </Field>
                    <Field label="Veículo">
                        <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                            <option value="all">Todos os veículos</option>
                            {vehicles.map((item) => <option key={item.id} value={item.id}>{item.placa} - {item.modelo}</option>)}
                        </Select>
                    </Field>
                    <Field label="Tipo">
                        <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                            <option value="all">Todos os tipos</option>
                            {maintenanceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </Select>
                    </Field>
                    <div className="flex items-end">
                        <p className="rounded-full border border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-surface)]">{filtered.length} manutenções</p>
                    </div>
                </FilterBar>

                <div className="overflow-x-auto">
                    <Table className="min-w-[980px]">
                        <TableHead>
                            <TableRow className="border-t-0">
                                <TableHeader>Manutenção</TableHeader>
                                <TableHeader>Ações</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? <TableRow><TableCell colSpan={2} className="py-8 text-center text-[var(--color-text-secondary)]">Carregando manutenções...</TableCell></TableRow> : null}
                            {!isLoading && visible.length === 0 ? <TableRow><TableCell colSpan={2} className="py-8 text-center text-[var(--color-text-secondary)]">Nenhuma manutenção encontrada.</TableCell></TableRow> : null}
                            {!isLoading && visible.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="py-3 align-top"><MaintenanceBlock item={item} /></TableCell>
                                    <TableCell className="w-56 py-3 align-top">
                                        <div className="flex gap-2">
                                            <Button className="h-8 w-24 px-3" variant="outline" onClick={() => openEdit(item)}>Editar</Button>
                                            <Button className="h-8 w-24 px-3" variant="danger" onClick={() => setRemoving(item)}>Excluir</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
            </Card>

            <Modal open={isModalOpen} title={editing ? "Editar manutenção" : "Nova manutenção"} onClose={() => setIsModalOpen(false)}>
                <form className="space-y-4" onSubmit={submit}>
                    <FormSection title="Dados da manutenção">
                        <Field label="Data"><Input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} required /></Field>
                        <Field label="Veículo"><Select value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: Number(event.target.value) })} required><option value={0}>Selecione o veículo</option>{vehicles.map((item) => <option key={item.id} value={item.id}>{item.placa} - {item.modelo}</option>)}</Select></Field>
                        <Field label="Funcionário"><Select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: Number(event.target.value) })} required><option value={0}>Selecione o funcionário</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.nome} - {item.funcao}</option>)}</Select></Field>
                        <Field label="Tipo"><Select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })} required>{maintenanceTypes.map((type) => <option key={type} value={type}>{type}</option>)}</Select></Field>
                        <Field label="Valor"><Input inputMode="decimal" value={form.valor} onChange={(event) => setForm({ ...form, valor: toNumber(event.target.value) })} required /></Field>
                        <Field label="Observações"><Input value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} /></Field>
                    </FormSection>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={Boolean(removing)} title="Excluir manutenção" description="Confirma a exclusão desta manutenção?" confirmLabel="Excluir" onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
        </section>
    );
}

function MaintenanceBlock({ item }: { item: Maintenance }) {
    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-surface)]">
                            <Wrench size={14} />
                            {item.tipo || "Manutenção"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                            <CalendarDays size={14} />
                            {formatDate(item.data)}
                        </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="inline-flex min-w-0 items-center gap-2"><Truck size={16} className="shrink-0 text-[var(--color-surface)]" /><span className="truncate">{item.vehicleLabel || "-"}</span></span>
                        <span className="inline-flex min-w-0 items-center gap-2"><UserRound size={16} className="shrink-0 text-[var(--color-surface)]" /><span className="truncate">{item.employeeName || item.responsavel || "-"}</span></span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-md border border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    <DollarSign size={16} className="text-[var(--color-surface)]" />
                    {formatCurrency(item.valor)}
                </div>
            </div>

            <div className="mt-4 min-w-0">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"><FileText size={14} /> Observações</p>
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]" title={item.observacoes || "-"}>{item.observacoes || "-"}</p>
            </div>
        </div>
    );
}

function toNumber(value: string) { return Number(value.replace(",", ".")); }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function formatCurrency(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }

