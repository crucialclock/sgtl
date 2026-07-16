import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ConfirmDialog, Field, FilterBar, FormSection, Modal, StatusBadge } from "../components/ui/layout";
import { Pagination } from "../components/ui/pagination";
import { Select } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../components/ui/toast";
import { usersService } from "../services/users-service";
import type { AuthUser, UserRole } from "../types/auth";

type UserForm = { name: string; email: string; password: string; role: UserRole };

const emptyForm: UserForm = { name: "", email: "", password: "", role: "employee" };
const pageSize = 5;

function accessLabel(role: UserRole) {
    return role === "admin" ? "Administrador" : "Básico";
}

export function UsersPage() {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [form, setForm] = useState<UserForm>(emptyForm);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "employee" as UserRole, password: "" });
    const [confirmUser, setConfirmUser] = useState<AuthUser | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch = !term || `${user.name} ${user.email}`.toLowerCase().includes(term);
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || (statusFilter === "active" && user.isActive) || (statusFilter === "inactive" && !user.isActive);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roleFilter, search, statusFilter, users]);

    const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => setPage(1), [roleFilter, search, statusFilter]);
    useEffect(() => {
        void loadUsers();
    }, []);

    async function loadUsers() {
        setIsLoading(true);
        try {
            setUsers(await usersService.list());
        } catch (error) {
            toast({ title: "Erro ao carregar usuários", description: error instanceof Error ? error.message : undefined, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    function openCreate() {
        setForm(emptyForm);
        setIsCreateOpen(true);
    }

    async function createUser(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role };

        if (!payload.name) return toast({ title: "Nome obrigatório", description: "Informe o nome do usuário.", type: "warning" });
        if (payload.password.length < 8) return toast({ title: "Senha muito curta", description: "A senha deve ter no mínimo 8 caracteres.", type: "warning" });

        try {
            await usersService.create(payload);
            setForm(emptyForm);
            setIsCreateOpen(false);
            await loadUsers();
            toast({ title: "Usuário criado", description: `${payload.name} foi adicionado ao SGTL.`, type: "success" });
        } catch (error) {
            toast({ title: "Erro ao criar usuário", description: error instanceof Error ? error.message : "Tente novamente em instantes.", type: "error" });
        }
    }

    function openEdit(user: AuthUser) {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role, password: "" });
    }

    async function saveEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingUser) return;

        if (editForm.password && editForm.password.length < 8) {
            toast({ title: "Senha muito curta", description: "A nova senha deve ter no mínimo 8 caracteres.", type: "warning" });
            return;
        }

        try {
            await usersService.update(editingUser.id, {
                name: editForm.name.trim(),
                email: editForm.email.trim().toLowerCase(),
                role: editForm.role,
            });

            if (editForm.password) {
                await usersService.updatePassword(editingUser.id, editForm.password);
            }

            setEditingUser(null);
            await loadUsers();
            toast({ title: "Usuário atualizado", description: "As alterações foram salvas.", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao atualizar usuário", description: error instanceof Error ? error.message : "Tente novamente em instantes.", type: "error" });
        }
    }

    async function toggleStatus() {
        if (!confirmUser) return;
        try {
            await usersService.update(confirmUser.id, { isActive: !confirmUser.isActive });
            setConfirmUser(null);
            await loadUsers();
            toast({ title: "Status atualizado", type: "success" });
        } catch (error) {
            toast({ title: "Erro ao atualizar status", description: error instanceof Error ? error.message : undefined, type: "error" });
        }
    }

    return (
        <section className="space-y-4">
            <div className="flex justify-between">
                <p className="text-sm text-[#4B5563]">Contas que podem acessar o sistema. Funcionários operacionais ficam em Cadastros.</p>
                <Button onClick={openCreate}>Novo usuário</Button>
            </div>

            <Card className="overflow-hidden">
                <FilterBar>
                    <Field label="Busca">
                        <Input placeholder="Nome ou e-mail" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </Field>
                    <Field label="Acesso">
                        <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}>
                            <option value="all">Todos os acessos</option>
                            <option value="admin">Administrador</option>
                            <option value="employee">Básico</option>
                        </Select>
                    </Field>
                    <Field label="Status">
                        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}>
                            <option value="all">Todos os status</option>
                            <option value="active">Ativos</option>
                            <option value="inactive">Inativos</option>
                        </Select>
                    </Field>
                    <div className="flex items-end">
                        <p className="rounded-full border border-[#BBF7D0] bg-[#ECFDF5] px-3 py-2 text-sm font-semibold text-[#006A4E]">{filteredUsers.length} usuários</p>
                    </div>
                </FilterBar>
                <div className="hidden overflow-x-auto md:block">
                    <Table className="min-w-190">
                        <TableHead>
                            <TableRow className="border-t-0">
                                <TableHeader>Nome</TableHeader>
                                <TableHeader>E-mail</TableHeader>
                                <TableHeader>Acesso</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Ações</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-[#4B5563]">
                                        Carregando usuários...
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading && visibleUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-[#4B5563]">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {!isLoading &&
                                visibleUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium text-[#1F2937]">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{accessLabel(user.role)}</TableCell>
                                        <TableCell>
                                            <StatusBadge tone={user.isActive ? "success" : "danger"}>{user.isActive ? "Ativo" : "Inativo"}</StatusBadge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button className="h-8 w-24 px-3" variant="outline" onClick={() => openEdit(user)}>
                                                    Editar
                                                </Button>
                                                <Button className="h-8 w-24 px-3" variant={user.isActive ? "danger" : "success"} onClick={() => setConfirmUser(user)}>
                                                    {user.isActive ? "Desativar" : "Ativar"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
                <Pagination page={page} pageSize={pageSize} totalItems={filteredUsers.length} onPageChange={setPage} />
            </Card>

            <Modal open={isCreateOpen} title="Novo usuário" description="Crie a conta de acesso e revise o nível antes de salvar. Esc fecha a janela." onClose={() => setIsCreateOpen(false)} size="lg">
                <form className="grid gap-5 lg:grid-cols-[1fr_260px]" onSubmit={createUser}>
                    <div className="space-y-4">
                        <FormSection title="Dados de acesso">
                            <Field label="Nome">
                                <Input placeholder="Nome completo" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                            </Field>
                            <Field label="E-mail">
                                <Input placeholder="usuario@empresa.com" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                            </Field>
                            <Field label="Senha" helper="A senha deve ter no mínimo 8 caracteres.">
                                <Input placeholder="Mínimo 8 caracteres" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                            </Field>
                            <Field label="Acesso">
                                <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                                    <option value="employee">Básico</option>
                                    <option value="admin">Administrador</option>
                                </Select>
                            </Field>
                        </FormSection>
                    </div>

                    <aside className="rounded-lg border border-[#D1D5DB] bg-[#F8F9FA] p-4">
                        <p className="text-sm font-semibold text-[#1F2937]">Resumo do acesso</p>
                        <dl className="mt-4 space-y-3 text-sm">
                            <SummaryItem label="Nome" value={form.name.trim() || "Não informado"} />
                            <SummaryItem label="E-mail" value={form.email.trim() || "Não informado"} />
                            <SummaryItem label="Acesso" value={accessLabel(form.role)} />
                            <SummaryItem label="Status inicial" value="Ativo" />
                        </dl>
                        <div className="mt-6 flex flex-col gap-2">
                            <Button type="submit">Criar usuário</Button>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </aside>
                </form>
            </Modal>

            <Modal open={Boolean(editingUser)} title="Editar usuário" description="Altere os dados de acesso e, se necessário, redefina a senha." onClose={() => setEditingUser(null)}>
                <form className="space-y-4" onSubmit={saveEdit}>
                    <FormSection title="Dados do usuário">
                        <Field label="Nome">
                            <Input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
                        </Field>
                        <Field label="E-mail">
                            <Input type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} required />
                        </Field>
                        <Field label="Acesso">
                            <Select value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as UserRole })}>
                                <option value="employee">Básico</option>
                                <option value="admin">Administrador</option>
                            </Select>
                        </Field>
                        <Field label="Nova senha" helper="Deixe em branco para manter a senha atual.">
                            <Input type="password" minLength={8} value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} />
                        </Field>
                    </FormSection>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar alterações</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog open={Boolean(confirmUser)} title={confirmUser?.isActive ? "Desativar usuário" : "Ativar usuário"} description={`Confirma a alteração de status de ${confirmUser?.name ?? "este usuário"}?`} confirmLabel={confirmUser?.isActive ? "Desativar" : "Ativar"} onCancel={() => setConfirmUser(null)} onConfirm={toggleStatus} />
        </section>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</dt>
            <dd className="mt-1 wrap-break-word font-medium text-[#1F2937]">{value}</dd>
        </div>
    );
}
