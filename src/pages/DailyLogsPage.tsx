import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, DollarSign, FileText, Gauge, MapPin, Truck, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Field, FilterBar, FormSection, Modal } from "../components/ui/layout";
import { Pagination } from "../components/ui/pagination";
import { Select } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { exportDailyLogsPdf } from "../lib/daily-logs-pdf";
import { dailyLogsService } from "../services/daily-logs-service";
import { destinationsService } from "../services/destinations-service";
import { driversService } from "../services/drivers-service";
import { vehiclesService } from "../services/vehicles-service";
import type { DailyLog, Destination, Driver, Vehicle } from "../types/operations";

const today = new Date().toISOString().slice(0, 10);
const pageSize = 5;

type NumericField = number | string;

type DailyLogForm = {
    data: string;
    nrNota: string;
    valorFrete: NumericField;
    kmSaida: NumericField;
    kmChegada: NumericField;
    metroTonelada: NumericField;
    vehicleId: number;
    driverId: number;
    originId: number;
    destinationId: number;
};

const emptyForm: DailyLogForm = {
    data: today,
    nrNota: "",
    valorFrete: "",
    kmSaida: "",
    kmChegada: "",
    metroTonelada: "",
    vehicleId: 0,
    driverId: 0,
    originId: 0,
    destinationId: 0,
};

export function DailyLogsPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const [editingDailyLog, setEditingDailyLog] = useState<DailyLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all");
    const [driverFilter, setDriverFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [form, setForm] = useState(emptyForm);
    const { toast } = useToast();

    const selectedVehicle = vehicles.find((item) => item.id === form.vehicleId);
    const selectedDriver = drivers.find((item) => item.id === form.driverId);
    const selectedOrigin = destinations.find((item) => item.id === form.originId);
    const selectedDestination = destinations.find((item) => item.id === form.destinationId);
    const distance = Math.max(0, toNumber(form.kmChegada) - toNumber(form.kmSaida));

    const filteredDailyLogs = useMemo(() => {
        const term = search.trim().toLowerCase();
        return dailyLogs.filter((item) => {
            const matchesSearch = !term || `${item.nrNota} ${item.vehicleLabel || ""} ${item.driverName || ""} ${item.originName || ""} ${item.destinationName || ""}`.toLowerCase().includes(term);
            const matchesVehicle = vehicleFilter === "all" || item.vehicleId === Number(vehicleFilter);
            const matchesDriver = driverFilter === "all" || item.driverId === Number(driverFilter);
            const matchesFrom = !dateFrom || item.data >= dateFrom;
            const matchesTo = !dateTo || item.data <= dateTo;
            return matchesSearch && matchesVehicle && matchesDriver && matchesFrom && matchesTo;
        });
    }, [dailyLogs, dateFrom, dateTo, driverFilter, search, vehicleFilter]);

    const visibleDailyLogs = filteredDailyLogs.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => setPage(1), [dateFrom, dateTo, driverFilter, search, vehicleFilter]);
    useEffect(() => {
        void loadAll();
    }, []);

    async function loadAll() {
        setIsLoading(true);
        try {
            const [nextVehicles, nextDrivers, nextDestinations, nextDailyLogs] = await Promise.all([vehiclesService.list(), driversService.list(), destinationsService.list(), dailyLogsService.list()]);
            setVehicles(nextVehicles);
            setDrivers(nextDrivers);
            setDestinations(nextDestinations);
            setDailyLogs(nextDailyLogs);
        } catch (error) {
            toast({ title: "Erro ao carregar diárias", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    function openCreate() {
        setEditingDailyLog(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    }

    function openEdit(item: DailyLog) {
        setEditingDailyLog(item);
        setForm({
            data: item.data,
            nrNota: item.nrNota,
            valorFrete: item.valorFrete,
            kmSaida: item.kmSaida,
            kmChegada: item.kmChegada,
            metroTonelada: item.metroTonelada,
            vehicleId: item.vehicleId,
            driverId: item.driverId,
            originId: item.originId,
            destinationId: item.destinationId,
        });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingDailyLog(null);
    }

    function selectVehicle(id: number) {
        const vehicle = vehicles.find((item) => item.id === id);
        setForm((current) => ({ ...current, vehicleId: id, kmSaida: editingDailyLog ? current.kmSaida : vehicle?.kmRodado || current.kmSaida }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = {
            ...form,
            valorFrete: toNumber(form.valorFrete),
            kmSaida: toNumber(form.kmSaida),
            kmChegada: toNumber(form.kmChegada),
            metroTonelada: toNumber(form.metroTonelada),
        };

        if ([payload.valorFrete, payload.kmSaida, payload.kmChegada, payload.metroTonelada].some((value) => !Number.isFinite(value))) {
            toast({ title: "Número inválido", description: "Use números com ponto ou vírgula, como 10,23 ou 10.23.", type: "warning" });
            return;
        }

        if (form.originId === form.destinationId) {
            toast({ title: "Origem e destino iguais", description: "A origem e o destino não podem ser iguais.", type: "warning" });
            return;
        }
        if (payload.kmChegada <= payload.kmSaida) {
            toast({ title: "KM inválido", description: "O KM de chegada deve ser maior que o de saída.", type: "warning" });
            return;
        }
        try {
            if (editingDailyLog) {
                await dailyLogsService.update(editingDailyLog.id, payload);
                toast({ title: "Diária atualizada", description: "As alterações da diária foram salvas.", type: "success" });
            } else {
                await dailyLogsService.create(payload);
                toast({ title: "Diária registrada", type: "success" });
            }
            closeModal();
            await loadAll();
        } catch (error) {
            toast({ title: editingDailyLog ? "Erro ao editar diária" : "Erro ao registrar diária", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function remove(id: number) {
        try {
            await dailyLogsService.remove(id);
            await loadAll();
            toast({ title: "Diária removida", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao remover diária", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function exportPdf() {
        if (filteredDailyLogs.length === 0) {
            toast({ title: "Nada para exportar", description: "Ajuste os filtros ou registre uma diária antes de gerar o PDF.", type: "warning" });
            return;
        }

        try {
            const saved = await exportDailyLogsPdf(filteredDailyLogs, { search, vehicle: vehicleFilter, driver: driverFilter, dateFrom, dateTo });
            if (saved) toast({ title: "PDF salvo", description: "O relatório de diárias foi salvo no local escolhido.", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao exportar PDF", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">Controle lançamentos, fretes e quilometragem por viagem.</p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={exportPdf}>
                        Exportar PDF
                    </Button>
                    <Button onClick={openCreate}>Nova diária</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <FilterBar>
                    <Field label="Busca" className="md:col-span-2">
                        <Input placeholder="Nota, veículo, funcionário ou rota" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </Field>
                    <div className="flex items-end">
                        <Button className="w-full" variant="outline" onClick={() => setIsAdvancedOpen((current) => !current)}>
                            {isAdvancedOpen ? "Ocultar filtros" : "Filtros avançados"}
                        </Button>
                    </div>
                    <div className="flex items-end">
                        <p className="rounded-full border border-accent-soft-strong bg-accent-soft px-3 py-2 text-sm font-semibold text-surface">{filteredDailyLogs.length} diárias</p>
                    </div>
                    {isAdvancedOpen && (
                        <>
                            <Field label="Veículo">
                                <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                                    <option value="all">Todos os veículos</option>
                                    {vehicles.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.placa}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Funcionário">
                                <Select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
                                    <option value="all">Todos os funcionários</option>
                                    {drivers.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="De">
                                <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                            </Field>
                            <Field label="Até">
                                <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                            </Field>
                        </>
                    )}
                </FilterBar>
                <div className="hidden overflow-x-auto md:block">
                    <Table className="min-w-245">
                        <TableHead>
                            <TableRow className="border-t-0">
                                <TableHeader>Diária</TableHeader>
                                <TableHeader>Ações da diária</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="py-8 text-center text-text-secondary">
                                        Carregando diárias...
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading && visibleDailyLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="py-8 text-center text-text-secondary">
                                        Nenhuma diária encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading &&
                                visibleDailyLogs.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="py-3 align-top">
                                            <DailyLogBlock item={item} />
                                        </TableCell>
                                        <TableCell className="w-56 py-3 align-top">
                                            <div className="flex gap-2">
                                                <Button className="h-8 w-24 px-3" variant="outline" onClick={() => openEdit(item)}>
                                                    Editar
                                                </Button>
                                                <Button className="h-8 w-24 px-3" variant="danger" onClick={() => remove(item.id)}>
                                                    Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                    {isLoading ? <p className="text-sm text-text-secondary">Carregando diárias...</p> : null}
                    {!isLoading && visibleDailyLogs.length === 0 ? <p className="text-sm text-text-secondary">Nenhuma diária encontrada.</p> : null}
                    {!isLoading &&
                        visibleDailyLogs.map((item) => (
                            <div key={item.id} className="rounded-lg border border-border-strong bg-white p-4 text-sm shadow-sm">
                                <DailyLogBlock item={item} compact />
                                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                                    <div className="flex gap-2">
                                        <Button className="h-8 w-24 px-3" variant="outline" onClick={() => openEdit(item)}>
                                            Editar
                                        </Button>
                                        <Button className="h-8 w-24 px-3" variant="danger" onClick={() => remove(item.id)}>
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <Pagination page={page} pageSize={pageSize} totalItems={filteredDailyLogs.length} onPageChange={setPage} />
            </Card>

            <Modal open={isModalOpen} title={editingDailyLog ? `Editar diária ${editingDailyLog.nrNota}` : "Nova diária"} description={editingDailyLog ? "Revise os dados da diária e salve as alterações. Esc fecha a janela." : "Organize a viagem por etapas antes de registrar. Esc fecha a janela."} onClose={closeModal} size="lg">
                <form className="grid gap-5 lg:grid-cols-[1fr_260px]" onSubmit={submit}>
                    <div className="space-y-4">
                        <FormSection title="Informações da viagem">
                            <Field label="Data">
                                <Input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} required />
                            </Field>
                            <Field label="Número da nota">
                                <Input placeholder="NF ou controle interno" value={form.nrNota} onChange={(event) => setForm({ ...form, nrNota: event.target.value })} required />
                            </Field>
                        </FormSection>
                        <FormSection title="Veículo e funcionário">
                            <Field label="Veículo">
                                <Select value={form.vehicleId} onChange={(event) => selectVehicle(Number(event.target.value))} required>
                                    <option value={0}>Selecione o veículo</option>
                                    {vehicles.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.placa} - {item.modelo}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Funcionário">
                                <Select value={form.driverId} onChange={(event) => setForm({ ...form, driverId: Number(event.target.value) })} required>
                                    <option value={0}>Selecione o funcionário</option>
                                    {drivers.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </FormSection>
                        <FormSection title="Rota">
                            <Field label="Origem">
                                <Select value={form.originId} onChange={(event) => setForm({ ...form, originId: Number(event.target.value) })} required>
                                    <option value={0}>Selecione a origem</option>
                                    {destinations.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Destino">
                                <Select value={form.destinationId} onChange={(event) => setForm({ ...form, destinationId: Number(event.target.value) })} required>
                                    <option value={0}>Selecione o destino</option>
                                    {destinations.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </FormSection>
                        <FormSection title="Quilometragem e valores">
                            <Field label="KM de saída">
                                <Input inputMode="decimal" value={form.kmSaida} onChange={(event) => setForm({ ...form, kmSaida: toNumberField(event.target.value) })} required />
                            </Field>
                            <Field label="KM de chegada">
                                <Input inputMode="decimal" value={form.kmChegada} onChange={(event) => setForm({ ...form, kmChegada: toNumberField(event.target.value) })} required />
                            </Field>
                            <Field label="Peso / volume">
                                <Input inputMode="decimal" placeholder="Tonelada ou m³" value={form.metroTonelada} onChange={(event) => setForm({ ...form, metroTonelada: toNumberField(event.target.value) })} required />
                            </Field>
                            <Field label="Valor do frete">
                                <Input inputMode="decimal" placeholder="0,00" value={form.valorFrete} onChange={(event) => setForm({ ...form, valorFrete: toNumberField(event.target.value) })} required />
                            </Field>
                        </FormSection>
                    </div>

                    <aside className="rounded-lg border border-border-strong bg-canvas p-4">
                        <p className="text-sm font-semibold text-(--color-text-primary)">Resumo da diária</p>
                        <dl className="mt-4 space-y-3 text-sm">
                            <SummaryItem label="Veículo" value={selectedVehicle ? `${selectedVehicle.placa} - ${selectedVehicle.modelo}` : "Não selecionado"} />
                            <SummaryItem label="Funcionário" value={selectedDriver?.nome || "Não selecionado"} />
                            <SummaryItem label="Rota" value={selectedOrigin && selectedDestination ? `${selectedOrigin.nome} → ${selectedDestination.nome}` : "Origem e destino pendentes"} />
                            <SummaryItem label="Distância" value={`${distance} km`} />
                            <SummaryItem label="Frete" value={formatCurrency(toNumber(form.valorFrete))} />
                        </dl>
                        <div className="mt-6 flex flex-col gap-2">
                            <Button type="submit">{editingDailyLog ? "Salvar edição" : "Registrar diária"}</Button>
                            <Button variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                        </div>
                    </aside>
                </form>
            </Modal>
        </section>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</dt>
            <dd className="mt-1 font-medium text-(--color-text-primary)">{value}</dd>
        </div>
    );
}

function DailyLogBlock({ item, compact = false }: { item: DailyLog; compact?: boolean }) {
    const distance = Math.max(0, item.kmChegada - item.kmSaida);

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-soft-strong bg-accent-soft px-2.5 py-1 text-xs font-semibold text-surface">
                            <FileText size={14} />
                            Nota {item.nrNota}
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
                            <span className="truncate">{item.driverName || "-"}</span>
                        </span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-md border border-accent-soft-strong bg-accent-soft px-3 py-2 text-sm font-semibold text-(--color-text-primary)">
                    <DollarSign size={16} className="text-surface" />
                    {formatCurrency(item.valorFrete)}
                </div>
            </div>

            <div className={compact ? "mt-4 space-y-3" : "mt-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]"}>
                <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <MapPin size={14} />
                        Rota
                    </p>
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="min-w-0 truncate text-sm font-semibold text-(--color-text-primary)" title={item.originName || "-"}>
                            {item.originName || "-"}
                        </span>
                        <ArrowRight size={16} className="hidden shrink-0 text-surface sm:block" />
                        <span className="h-px w-8 bg-border-strong sm:hidden" />
                        <span className="min-w-0 truncate text-sm font-semibold text-(--color-text-primary)" title={item.destinationName || "-"}>
                            {item.destinationName || "-"}
                        </span>
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <Gauge size={14} />
                        Quilometragem
                    </p>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                        <span>
                            <span className="text-text-muted">Saída</span> <strong className="text-(--color-text-primary)">{formatNumber(item.kmSaida)}</strong>
                        </span>
                        <span className="text-border-strong">/</span>
                        <span>
                            <span className="text-text-muted">Chegada</span> <strong className="text-(--color-text-primary)">{formatNumber(item.kmChegada)}</strong>
                        </span>
                        <span className="rounded-full bg-canvas-strong px-2 py-0.5 text-xs font-semibold text-text-secondary">{formatNumber(distance)} km</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function toNumberField(value: string): NumericField {
    return value.replace(/[^\d.,-]/g, "");
}

function toNumber(value: NumericField): number {
    if (typeof value === "number") {
        return value;
    }

    const normalized = value.trim().replace(",", ".");
    return normalized === "" ? 0 : Number(normalized);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
