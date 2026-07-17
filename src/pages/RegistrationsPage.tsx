import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ConfirmDialog, Field, FilterBar, FormSection, Modal } from "../components/ui/layout";
import { Pagination } from "../components/ui/pagination";
import { Select } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { formatPhone, formatPlate, normalizePlate } from "../lib/masks";
import { destinationsService } from "../services/destinations-service";
import { driversService } from "../services/drivers-service";
import { vehiclesService } from "../services/vehicles-service";
import type { Destination, Driver, Vehicle } from "../types/operations";

type Tab = "vehicles" | "drivers" | "destinations";
type EditingItem = { kind: "vehicles"; item: Vehicle } | { kind: "drivers"; item: Driver } | { kind: "destinations"; item: Destination };

const pageSize = 5;
const vehicleTypes = ["CARRETA", "CAMINHÃO", "VUC", "BITREM", "RODOTREM"];
const emptyVehicle = { tipo: "CARRETA", modelo: "", placa: "", qtEixos: 2, kmRodado: 0 };
const emptyDriver = { nome: "", telefone: "", funcao: "Motorista", comissao: 0 };
const emptyDestination = { nome: "", endereco: "", numero: "" };

export function RegistrationsPage() {
    const [tab, setTab] = useState<Tab>("vehicles");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EditingItem | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
    const [driverForm, setDriverForm] = useState(emptyDriver);
    const [destinationForm, setDestinationForm] = useState(emptyDestination);
    const [search, setSearch] = useState("");
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const filteredVehicles = useMemo(() => {
        const term = search.trim().toLowerCase();
        return vehicles.filter((item) => {
            const matchesSearch = !term || `${item.placa} ${item.modelo} ${item.tipo}`.toLowerCase().includes(term);
            const matchesType = vehicleTypeFilter === "all" || item.tipo === vehicleTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [search, vehicleTypeFilter, vehicles]);

    const filteredDrivers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return drivers.filter((item) => !term || `${item.nome} ${item.telefone} ${item.funcao}`.toLowerCase().includes(term));
    }, [drivers, search]);

    const filteredDestinations = useMemo(() => {
        const term = search.trim().toLowerCase();
        return destinations.filter((item) => !term || `${item.nome} ${item.endereco} ${item.numero}`.toLowerCase().includes(term));
    }, [destinations, search]);

    useEffect(() => {
        void loadAll();
    }, []);
    useEffect(() => {
        setSearch("");
        setVehicleTypeFilter("all");
        setPage(1);
    }, [tab]);
    useEffect(() => setPage(1), [search, vehicleTypeFilter]);

    async function loadAll() {
        setIsLoading(true);
        try {
            const [nextVehicles, nextDrivers, nextDestinations] = await Promise.all([vehiclesService.list(), driversService.list(), destinationsService.list()]);
            setVehicles(nextVehicles);
            setDrivers(nextDrivers);
            setDestinations(nextDestinations);
        } catch (error) {
            toast({ title: "Erro ao carregar cadastros", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    function openCreate() {
        setEditingItem(null);
        setVehicleForm(emptyVehicle);
        setDriverForm(emptyDriver);
        setDestinationForm(emptyDestination);
        setIsModalOpen(true);
    }

    function openEdit(target: EditingItem) {
        setEditingItem(target);
        setTab(target.kind);
        if (target.kind === "vehicles") setVehicleForm({ tipo: target.item.tipo, modelo: target.item.modelo, placa: formatPlate(target.item.placa), qtEixos: target.item.qtEixos, kmRodado: target.item.kmRodado });
        if (target.kind === "drivers") setDriverForm({ nome: target.item.nome, telefone: target.item.telefone, funcao: target.item.funcao, comissao: target.item.comissao });
        if (target.kind === "destinations") setDestinationForm({ nome: target.item.nome, endereco: target.item.endereco, numero: target.item.numero });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingItem(null);
    }

    async function submitVehicle(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = { ...vehicleForm, placa: normalizePlate(vehicleForm.placa), modelo: vehicleForm.modelo.trim().toUpperCase() };
        try {
            if (editingItem?.kind === "vehicles") {
                await vehiclesService.update(editingItem.item.id, payload);
                toast({ title: "Veículo atualizado", type: "success" });
            } else {
                await vehiclesService.create(payload);
                toast({ title: "Veículo cadastrado", type: "success" });
            }
            closeModal();
            await loadAll();
        } catch (error) {
            toast({ title: "Erro ao salvar veículo", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function submitDriver(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = { ...driverForm, nome: driverForm.nome.trim() };
        try {
            if (editingItem?.kind === "drivers") {
                await driversService.update(editingItem.item.id, payload);
                toast({ title: "Funcionário atualizado", type: "success" });
            } else {
                await driversService.create(payload);
                toast({ title: "Funcionário cadastrado", type: "success" });
            }
            closeModal();
            await loadAll();
        } catch (error) {
            toast({ title: "Erro ao salvar funcionário", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function submitDestination(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = { ...destinationForm, nome: destinationForm.nome.trim(), endereco: destinationForm.endereco.trim(), numero: destinationForm.numero.trim() };
        try {
            if (editingItem?.kind === "destinations") {
                await destinationsService.update(editingItem.item.id, payload);
                toast({ title: "Destino atualizado", type: "success" });
            } else {
                await destinationsService.create(payload);
                toast({ title: "Destino cadastrado", type: "success" });
            }
            closeModal();
            await loadAll();
        } catch (error) {
            toast({ title: "Erro ao salvar destino", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.kind === "vehicles") await vehiclesService.remove(deleteTarget.item.id);
            if (deleteTarget.kind === "drivers") await driversService.remove(deleteTarget.item.id);
            if (deleteTarget.kind === "destinations") await destinationsService.remove(deleteTarget.item.id);
            setDeleteTarget(null);
            await loadAll();
            toast({ title: "Registro removido", type: "success" });
        } catch (error) {
            toast({ title: "Não foi possível remover", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    const rows =
        tab === "vehicles"
            ? filteredVehicles.map((item) => [item.placa, item.modelo, item.tipo, item.qtEixos, item.kmRodado, <RowActions onEdit={() => openEdit({ kind: "vehicles", item })} onDelete={() => setDeleteTarget({ kind: "vehicles", item })} />])
            : tab === "drivers"
              ? filteredDrivers.map((item) => [item.nome, item.telefone, item.funcao, `${item.comissao}%`, <RowActions onEdit={() => openEdit({ kind: "drivers", item })} onDelete={() => setDeleteTarget({ kind: "drivers", item })} />])
              : filteredDestinations.map((item) => [item.nome, item.endereco, item.numero || "-", <RowActions onEdit={() => openEdit({ kind: "destinations", item })} onDelete={() => setDeleteTarget({ kind: "destinations", item })} />]);

    const headers = tab === "vehicles" ? ["Placa", "Modelo", "Tipo", "Eixos", "KM", "Ações"] : tab === "drivers" ? ["Nome", "Telefone", "Comissão", "Ações"] : ["Nome", "Endereço", "Número", "Ações"];
    const modalTitle = editingItem ? "Editar cadastro" : tab === "vehicles" ? "Novo veículo" : tab === "drivers" ? "Novo funcionário" : "Novo destino";
    const deleteName = deleteTarget ? getDeleteName(deleteTarget) : "este registro";

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button variant={tab === "vehicles" ? "default" : "outline"} onClick={() => setTab("vehicles")}>
                        Veículos
                    </Button>
                    <Button variant={tab === "drivers" ? "default" : "outline"} onClick={() => setTab("drivers")}>
                        Funcionários
                    </Button>
                    <Button variant={tab === "destinations" ? "default" : "outline"} onClick={() => setTab("destinations")}>
                        Destinos
                    </Button>
                </div>
                <Button onClick={openCreate}>Novo cadastro</Button>
            </div>

            <Card className="overflow-hidden">
                <FilterBar>
                    <Field label="Busca" className={tab === "vehicles" ? "md:col-span-2" : "md:col-span-3"}>
                        <Input placeholder={tab === "vehicles" ? "Placa, modelo ou tipo" : tab === "drivers" ? "Nome, telefone ou função" : "Nome, endereço ou número"} value={search} onChange={(event) => setSearch(event.target.value)} />
                    </Field>
                    {tab === "vehicles" && (
                        <Field label="Tipo de veículo">
                            <Select value={vehicleTypeFilter} onChange={(event) => setVehicleTypeFilter(event.target.value)}>
                                <option value="all">Todos os tipos</option>
                                {[...new Set(vehicles.map((item) => item.tipo))].map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    )}
                    <div className="flex items-end">
                        <p className="rounded-full border border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-surface)]">{rows.length} registros</p>
                    </div>
                </FilterBar>
                <SimpleTable headers={headers} loading={isLoading} onPageChange={setPage} page={page} rows={rows} />
            </Card>

            <Modal open={isModalOpen} title={modalTitle} description="Preencha os dados principais e salve para atualizar a listagem." onClose={closeModal}>
                {tab === "vehicles" && (
                    <form className="space-y-4" onSubmit={submitVehicle}>
                        <FormSection title="Dados do veículo">
                            <Field label="Modelo / descrição">
                                <Input placeholder="Ex.: Scania R450" value={vehicleForm.modelo} onChange={(event) => setVehicleForm({ ...vehicleForm, modelo: event.target.value })} required />
                            </Field>
                            <Field label="Placa" helper="Aceita o padrão Mercosul.">
                                <Input placeholder="ABC-1D23" value={vehicleForm.placa} onChange={(event) => setVehicleForm({ ...vehicleForm, placa: formatPlate(event.target.value) })} required />
                            </Field>
                            <Field label="Tipo">
                                <Select value={vehicleForm.tipo} onChange={(event) => setVehicleForm({ ...vehicleForm, tipo: event.target.value })}>
                                    {vehicleTypes.map((type) => (
                                        <option key={type}>{type}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Eixos">
                                <Input type="number" value={vehicleForm.qtEixos} onChange={(event) => setVehicleForm({ ...vehicleForm, qtEixos: Number(event.target.value) })} required />
                            </Field>
                            <Field label="KM atual">
                                <Input type="number" value={vehicleForm.kmRodado} onChange={(event) => setVehicleForm({ ...vehicleForm, kmRodado: Number(event.target.value) })} required />
                            </Field>
                        </FormSection>
                        <FormActions editing={Boolean(editingItem)} onCancel={closeModal} />
                    </form>
                )}
                {tab === "drivers" && (
                    <form className="space-y-4" onSubmit={submitDriver}>
                        <FormSection title="Dados do funcionário">
                            <Field label="Nome">
                                <Input placeholder="Nome completo" value={driverForm.nome} onChange={(event) => setDriverForm({ ...driverForm, nome: event.target.value })} required />
                            </Field>
                            <Field label="Telefone">
                                <Input inputMode="tel" placeholder="(00) 00000-0000" value={driverForm.telefone} onChange={(event) => setDriverForm({ ...driverForm, telefone: formatPhone(event.target.value) })} required />
                            </Field>
                            <Field label="Comissão (%)">
                                <Input type="number" value={driverForm.comissao} onChange={(event) => setDriverForm({ ...driverForm, comissao: Number(event.target.value) })} required />
                            </Field>
                        </FormSection>
                        <FormActions editing={Boolean(editingItem)} onCancel={closeModal} />
                    </form>
                )}
                {tab === "destinations" && (
                    <form className="space-y-4" onSubmit={submitDestination}>
                        <FormSection title="Dados do destino">
                            <Field label="Nome">
                                <Input placeholder="Ex.: Porto de Santos" value={destinationForm.nome} onChange={(event) => setDestinationForm({ ...destinationForm, nome: event.target.value })} required />
                            </Field>
                            <Field label="Endereço">
                                <Input placeholder="Rua, avenida ou referência" value={destinationForm.endereco} onChange={(event) => setDestinationForm({ ...destinationForm, endereco: event.target.value })} required />
                            </Field>
                            <Field label="Número">
                                <Input placeholder="Opcional" value={destinationForm.numero} onChange={(event) => setDestinationForm({ ...destinationForm, numero: event.target.value })} />
                            </Field>
                        </FormSection>
                        <FormActions editing={Boolean(editingItem)} onCancel={closeModal} />
                    </form>
                )}
            </Modal>

            <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir registro" description={`Confirma a exclusão de ${deleteName}? Registros vinculados a diárias não podem ser excluídos.`} confirmLabel="Excluir" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
        </section>
    );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex gap-2">
            <Button className="h-8 w-24 px-3" variant="outline" onClick={onEdit}>
                Editar
            </Button>
            <Button className="h-8 w-24 px-3" variant="danger" onClick={onDelete}>
                Excluir
            </Button>
        </div>
    );
}

function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
    return (
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit">{editing ? "Salvar alterações" : "Salvar"}</Button>
        </div>
    );
}

function SimpleTable({ headers, rows, page, onPageChange, loading }: { headers: string[]; rows: Array<Array<ReactNode>>; page: number; onPageChange: (page: number) => void; loading: boolean }) {
    const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <div className="hidden overflow-x-auto md:block">
                <Table>
                    <TableHead>
                        <TableRow className="border-t-0">
                            {headers.map((header) => (
                                <TableHeader key={header}>{header}</TableHeader>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={headers.length} className="py-8 text-center text-[var(--color-text-secondary)]">
                                    Carregando registros...
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {!loading && visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={headers.length} className="py-8 text-center text-[var(--color-text-secondary)]">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {!loading &&
                            visibleRows.map((row, index) => (
                                <TableRow key={index}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
                {loading ? <p className="text-sm text-[var(--color-text-secondary)]">Carregando registros...</p> : null}
                {!loading && visibleRows.length === 0 ? <p className="text-sm text-[var(--color-text-secondary)]">Nenhum registro encontrado.</p> : null}
                {!loading &&
                    visibleRows.map((row, index) => (
                        <div key={index} className="rounded-lg border border-[var(--color-border-strong)] bg-white p-3 text-sm">
                            {row.map((cell, cellIndex) => (
                                <div key={cellIndex} className="flex justify-between gap-3 border-b border-[var(--color-canvas-strong)] py-2">
                                    <span className="font-semibold text-[var(--color-text-secondary)]">{headers[cellIndex]}</span>
                                    <span className="text-right text-[var(--color-text-primary)]">{cell}</span>
                                </div>
                            ))}
                        </div>
                    ))}
            </div>
            <Pagination page={page} pageSize={pageSize} totalItems={rows.length} onPageChange={onPageChange} />
        </>
    );
}

function getDeleteName(target: EditingItem) {
    if (target.kind === "vehicles") return target.item.placa;
    return target.item.nome;
}

