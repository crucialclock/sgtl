import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, DollarSign, Droplets, FileText, Fuel, Truck, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ConfirmDialog, Field, FilterBar, FormSection, Modal } from "../components/ui/layout";
import { Pagination } from "../components/ui/pagination";
import { Select } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { exportFuelingsPdf } from "../lib/vehicle-events-pdf";
import { fuelingsService, type FuelingInput } from "../services/fuelings-service";
import { driversService } from "../services/drivers-service";
import { vehiclesService } from "../services/vehicles-service";
import type { Driver, Fueling, Vehicle } from "../types/operations";

const today = new Date().toISOString().slice(0, 10);
const pageSize = 5;
const emptyForm: FuelingInput = { data: today, qtLitrosInicial: 0, qtLitrosFinal: 0, valorLitroDiesel: 0, observacoes: "", vehicleId: 0, employeeId: 0 };

export function FuelingsPage() {
    const [fuelings, setFuelings] = useState<Fueling[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [employees, setEmployees] = useState<Driver[]>([]);
    const [form, setForm] = useState<FuelingInput>(emptyForm);
    const [editing, setEditing] = useState<Fueling | null>(null);
    const [removing, setRemoving] = useState<Fueling | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const { toast } = useToast();

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return fuelings.filter((item) => {
            const matchesSearch = !term || `${item.vehicleLabel || ""} ${item.employeeName || ""} ${item.observacoes}`.toLowerCase().includes(term);
            const matchesVehicle = vehicleFilter === "all" || item.vehicleId === Number(vehicleFilter);
            return matchesSearch && matchesVehicle;
        });
    }, [fuelings, search, vehicleFilter]);

    const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        void loadAll();
    }, []);
    useEffect(() => setPage(1), [search, vehicleFilter]);

    async function loadAll() {
        setIsLoading(true);
        try {
            const [nextFuelings, nextVehicles, nextEmployees] = await Promise.all([fuelingsService.list(), vehiclesService.list(), driversService.list()]);
            setFuelings(nextFuelings);
            setVehicles(nextVehicles);
            setEmployees(nextEmployees);
        } catch (error) {
            toast({ title: "Erro ao carregar abastecimentos", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    }

    function openEdit(item: Fueling) {
        setEditing(item);
        setForm({ data: item.data, qtLitrosInicial: item.qtLitrosInicial, qtLitrosFinal: item.qtLitrosFinal, valorLitroDiesel: item.valorLitroDiesel, observacoes: item.observacoes, vehicleId: item.vehicleId, employeeId: item.employeeId });
        setIsModalOpen(true);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            if (editing) {
                await fuelingsService.update(editing.id, form);
                toast({ title: "Abastecimento atualizado", type: "success" });
            } else {
                await fuelingsService.create(form);
                toast({ title: "Abastecimento registrado", type: "success" });
            }
            setIsModalOpen(false);
            await loadAll();
        } catch (error) {
            toast({ title: "Erro ao salvar abastecimento", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function confirmRemove() {
        if (!removing) return;
        try {
            await fuelingsService.remove(removing.id);
            setRemoving(null);
            await loadAll();
            toast({ title: "Abastecimento removido", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao remover abastecimento", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function exportPdf() {
        if (filtered.length === 0) {
            toast({ title: "Nada para exportar", type: "warning" });
            return;
        }

        const saved = await exportFuelingsPdf(filtered);
        if (saved) toast({ title: "PDF salvo", type: "success" });
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">Registre abastecimentos vinculados aos veículos da frota.</p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={exportPdf}>
                        Exportar PDF
                    </Button>
                    <Button onClick={openCreate}>Novo abastecimento</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <FilterBar>
                    <Field label="Busca" className="md:col-span-2">
                        <Input placeholder="Veículo, funcionário ou observação" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </Field>
                    <Field label="Veículo">
                        <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                            <option value="all">Todos os veículos</option>
                            {vehicles.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.placa} - {item.modelo}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <div className="flex items-end">
                        <p className="rounded-full border border-accent-soft-strong bg-accent-soft px-3 py-2 text-sm font-semibold text-surface">{filtered.length} abastecimentos</p>
                    </div>
                </FilterBar>

                <div className="overflow-x-auto">
                    <Table className="min-w-245">
                        <TableHead>
                            <TableRow className="border-t-0">
                                <TableHeader>Abastecimento</TableHeader>
                                <TableHeader>Ações</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="py-8 text-center text-text-secondary">
                                        Carregando abastecimentos...
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading && filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="py-8 text-center text-text-secondary">
                                        Nenhum abastecimento encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading &&
                                visible.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="py-3 align-top">
                                            <FuelingBlock item={item} />
                                        </TableCell>
                                        <TableCell className="w-56 py-3 align-top">
                                            <div className="flex gap-2">
                                                <Button className="h-8 w-24 px-3" variant="outline" onClick={() => openEdit(item)}>
                                                    Editar
                                                </Button>
                                                <Button className="h-8 w-24 px-3" variant="danger" onClick={() => setRemoving(item)}>
                                                    Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
            </Card>

            <Modal open={isModalOpen} title={editing ? "Editar abastecimento" : "Novo abastecimento"} onClose={() => setIsModalOpen(false)}>
                <form className="space-y-4" onSubmit={submit}>
                    <FormSection title="Dados do abastecimento">
                        <Field label="Data">
                            <Input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} required />
                        </Field>
                        <Field label="Veículo">
                            <Select value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: Number(event.target.value) })} required>
                                <option value={0}>Selecione o veículo</option>
                                {vehicles.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.placa} - {item.modelo}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Funcionário">
                            <Select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: Number(event.target.value) })} required>
                                <option value={0}>Selecione o funcionário</option>
                                {employees.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nome} - {item.funcao}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Litros iniciais">
                            <Input inputMode="decimal" value={form.qtLitrosInicial} onChange={(event) => setForm({ ...form, qtLitrosInicial: toNumber(event.target.value) })} required />
                        </Field>
                        <Field label="Litros finais">
                            <Input inputMode="decimal" value={form.qtLitrosFinal} onChange={(event) => setForm({ ...form, qtLitrosFinal: toNumber(event.target.value) })} required />
                        </Field>
                        <Field label="Valor do litro">
                            <Input inputMode="decimal" value={form.valorLitroDiesel} onChange={(event) => setForm({ ...form, valorLitroDiesel: toNumber(event.target.value) })} required />
                        </Field>
                        <Field label="Observações">
                            <Input value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} />
                        </Field>
                    </FormSection>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={Boolean(removing)} title="Excluir abastecimento" description="Confirma a exclusão deste abastecimento?" confirmLabel="Excluir" onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />
        </section>
    );
}

function FuelingBlock({ item }: { item: Fueling }) {
    const liters = Math.max(0, item.qtLitrosFinal - item.qtLitrosInicial);
    const total = liters * item.valorLitroDiesel;

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-soft-strong bg-accent-soft px-2.5 py-1 text-xs font-semibold text-surface">
                            <Fuel size={14} />
                            Abastecimento
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                            <CalendarDays size={14} />
                            {formatDate(item.data)}
                        </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                        <span className="inline-flex min-w-0 items-center gap-2">
                            <Truck size={16} className="shrink-0 text-surface" />
                            <span className="truncate">{item.vehicleLabel || "-"}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-2">
                            <UserRound size={16} className="shrink-0 text-surface" />
                            <span className="truncate">{item.employeeName || "-"}</span>
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-md border border-accent-soft-strong bg-accent-soft px-3 py-2 text-sm font-semibold text-(--color-text-primary)">
                    <DollarSign size={16} className="text-surface" />
                    {formatCurrency(total)}
                </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <Droplets size={14} /> Consumo
                    </p>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                        <span>
                            <span className="text-text-muted">Inicial</span> <strong className="text-(--color-text-primary)">{formatNumber(item.qtLitrosInicial)}</strong>
                        </span>
                        <span className="text-border-strong">/</span>
                        <span>
                            <span className="text-text-muted">Final</span> <strong className="text-(--color-text-primary)">{formatNumber(item.qtLitrosFinal)}</strong>
                        </span>
                        <span className="rounded-full bg-canvas-strong px-2 py-0.5 text-xs font-semibold text-text-secondary">{formatNumber(liters)} L</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <FileText size={14} /> Detalhes
                    </p>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                        <span>
                            <span className="text-text-muted">Valor/litro</span> <strong className="text-(--color-text-primary)">{formatCurrency(item.valorLitroDiesel)}</strong>
                        </span>
                        <span className="min-w-0 truncate text-text-secondary" title={item.observacoes || "-"}>
                            {item.observacoes || "-"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function toNumber(value: string) {
    return Number(value.replace(",", "."));
}
function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
function formatNumber(value: number) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}
