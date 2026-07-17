import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { BackupsPage } from "./pages/BackupsPage";
import { DailyLogsPage } from "./pages/DailyLogsPage";
import { FuelingsPage } from "./pages/FuelingsPage";
import { LoginPage } from "./pages/LoginPage";
import { MaintenancesPage } from "./pages/MaintenancesPage";
import { RegistrationsPage } from "./pages/RegistrationsPage";
import { UsersPage } from "./pages/UsersPage";
import * as authService from "./services/auth-service";
import type { AuthUser } from "./types/auth";

type Page = "registrations" | "dailyLogs" | "fuelings" | "maintenances" | "users" | "backups";

const allPages: Page[] = ["registrations", "dailyLogs", "fuelings", "maintenances", "users", "backups"];
const employeePages: Page[] = ["dailyLogs", "fuelings", "maintenances"];

const pageMeta: Record<Page, { title: string; eyebrow: string; description: string }> = {
    registrations: {
        title: "Cadastros",
        eyebrow: "Base operacional",
        description: "Organize veículos, funcionários e destinos antes de lançar viagens.",
    },
    dailyLogs: {
        title: "Diárias",
        eyebrow: "Operação",
        description: "Registre fretes, quilometragem, rotas e histórico das operações.",
    },
    fuelings: {
        title: "Abastecimentos",
        eyebrow: "Frota",
        description: "Registre abastecimentos vinculados aos veículos.",
    },
    maintenances: {
        title: "Manutenções",
        eyebrow: "Frota",
        description: "Registre manutenções, custos e responsáveis por veículo.",
    },
    users: {
        title: "Usuários",
        eyebrow: "Administração",
        description: "Gerencie acessos, permissões e status dos usuários do sistema.",
    },
    backups: {
        title: "Backups",
        eyebrow: "Administração",
        description: "Crie e baixe backups do banco SQLite.",
    },
};

const navLabels: Record<Page, string> = {
    registrations: "Cadastros",
    dailyLogs: "Diárias",
    fuelings: "Abastecimentos",
    maintenances: "Manutenções",
    users: "Usuários",
    backups: "Backups",
};

function App() {
    const [status, setStatus] = useState<"starting" | "ready" | "error">("starting");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState("");
    const [page, setPage] = useState<Page>("registrations");
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const allowedPages = user?.role === "admin" ? allPages : employeePages;
    const activePage = user && !allowedPages.includes(page) ? allowedPages[0] : page;

    useEffect(() => {
        let isMounted = true;

        async function bootstrap() {
            try {
                const currentUser = await authService.getCurrentUser();
                if (isMounted) {
                    setUser(currentUser);
                    setStatus("ready");
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Não foi possível conectar à API.");
                    setStatus("error");
                }
            }
        }

        void bootstrap();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (user && !allowedPages.includes(page)) {
            setPage(allowedPages[0]);
        }
    }, [allowedPages, page, user]);

    function handlePageChange(nextPage: Page) {
        setPage(nextPage);
        setIsMobileNavOpen(false);
    }

    function handleLogout() {
        authService.logout();
        setUser(null);
        setPage("registrations");
        setIsMobileNavOpen(false);
    }

    if (status === "starting") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-canvas px-4 text-(--color-text-primary)">
                <p className="text-lg font-semibold">Iniciando SGTL...</p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-canvas px-4 text-(--color-text-primary)">
                <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-(--color-accent-contrast)">Não foi possível conectar</h1>
                    <p className="mt-2 text-sm text-text-secondary">{error}</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <LoginPage
                onLogin={(nextUser) => {
                    setUser(nextUser);
                    setPage(nextUser.role === "admin" ? "registrations" : "dailyLogs");
                }}
            />
        );
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-canvas text-(--color-text-primary)">
            <div className="flex min-h-screen">
                <DesktopSidebar activePage={activePage} navPages={allowedPages} user={user} onPageChange={handlePageChange} />

                <section className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-border-strong bg-white/95 backdrop-blur md:static">
                        <div className="px-4 py-4 md:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <Button aria-label="Abrir menu" className="h-11 w-11 shrink-0 px-0 md:hidden" variant="outline" onClick={() => setIsMobileNavOpen(true)}>
                                        <Menu size={20} />
                                    </Button>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-surface">{pageMeta[activePage].eyebrow}</p>
                                        <h1 className="mt-1 truncate text-2xl font-semibold text-(--color-text-primary)">{pageMeta[activePage].title}</h1>
                                        <p className="mt-1 text-sm text-text-secondary">{pageMeta[activePage].description}</p>
                                    </div>
                                </div>
                                <Button className="min-h-11 w-full sm:w-auto" variant="outline" onClick={handleLogout}>
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </header>

                    <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-6">
                        {activePage === "users" && user.role === "admin" && <UsersPage />}
                        {activePage === "backups" && user.role === "admin" && <BackupsPage />}
                        {activePage === "registrations" && user.role === "admin" && <RegistrationsPage />}
                        {activePage === "dailyLogs" && <DailyLogsPage />}
                        {activePage === "fuelings" && <FuelingsPage />}
                        {activePage === "maintenances" && <MaintenancesPage />}
                    </div>
                </section>
            </div>

            <MobileDrawer open={isMobileNavOpen} activePage={activePage} navPages={allowedPages} onClose={() => setIsMobileNavOpen(false)} onPageChange={handlePageChange} />
        </main>
    );
}

function DesktopSidebar({ activePage, navPages, user, onPageChange }: { activePage: Page; navPages: Page[]; user: AuthUser; onPageChange: (page: Page) => void }) {
    return (
        <aside className="hidden w-72 border-r border-border-strong bg-(--color-text-primary) text-white md:block">
            <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
                <SidebarBrand />
                <NavList activePage={activePage} navPages={navPages} onPageChange={onPageChange} />
                <div className="border-t border-white/20 p-4">
                    <div className="rounded-md border border-white/20 bg-white/5 px-3 py-3">
                        <p className="text-xs uppercase tracking-wide text-white/50">Acesso</p>
                        <p className="mt-1 text-sm font-semibold">{user.role === "admin" ? "Administrador" : "Básico"}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function MobileDrawer({ open, activePage, navPages, onClose, onPageChange }: { open: boolean; activePage: Page; navPages: Page[]; onClose: () => void; onPageChange: (page: Page) => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            <button className="absolute inset-0 cursor-default bg-[rgba(31,41,55,0.42)]" aria-label="Fechar menu" onClick={onClose} />
            <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col overflow-hidden bg-(--color-text-primary) text-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/20">
                    <SidebarBrand compact />
                    <Button aria-label="Fechar menu" className="m-4 h-10 w-10 border-white/20 bg-white/10 px-0 text-white hover:bg-white/15" variant="ghost" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>
                <NavList activePage={activePage} navPages={navPages} onPageChange={onPageChange} />
            </aside>
        </div>
    );
}

function SidebarBrand({ compact = false }: { compact?: boolean }) {
    return (
        <div className={`border-b border-white/20 px-5 py-5 ${compact ? "border-b-0" : ""}`}>
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 bg-surface text-sm font-bold tracking-wide">SGTL</div>
                <div className="min-w-0">
                    <p className="text-xs text-white/60">
                        Sistema de Gestão de <br />
                        Transporte e Logística
                    </p>
                </div>
            </div>
        </div>
    );
}

function NavList({ activePage, navPages, onPageChange }: { activePage: Page; navPages: Page[]; onPageChange: (page: Page) => void }) {
    return (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navPages.map((navPage) => (
                <NavButton key={navPage} current={activePage} page={navPage} onClick={onPageChange}>
                    {navLabels[navPage]}
                </NavButton>
            ))}
        </nav>
    );
}

function NavButton({ current, page, children, onClick }: { current: Page; page: Page; children: string; onClick: (page: Page) => void }) {
    const isActive = current === page;

    return (
        <button className={`group flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-3 text-left text-sm font-medium transition-colors ${isActive ? "border-white bg-white text-(--color-text-primary)" : "border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white"}`} onClick={() => onClick(page)}>
            <span>{children}</span>
            <span className={`h-2 w-2 shrink-0 ${isActive ? "bg-surface" : "bg-transparent group-hover:bg-white/40"}`} />
        </button>
    );
}

export default App;
