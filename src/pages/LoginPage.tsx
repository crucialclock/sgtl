import { FormEvent, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Field } from "../components/ui/layout";
import { useToast } from "../components/ui/toast";
import type { AuthUser } from "../types/auth";
import * as authService from "../services/auth-service";

type Props = {
    onLogin: (user: AuthUser) => void;
};

export function LoginPage({ onLogin }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const { toast } = useToast();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");
        setIsLoading(true);

        try {
            const result = await authService.login(email, password);
            const currentUser = await authService.getCurrentUser();
            toast({ title: "Login realizado", description: "Bem-vindo ao SGTL.", type: "success" });
            onLogin(currentUser ?? result.user);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Verifique suas credenciais e tente novamente.";
            setFormError(message);
            toast({ title: "Não foi possível entrar", description: message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F8F9FA] text-[#1F2937]">
            <div className="absolute inset-0 opacity-70 mask-[radial-gradient(circle_at_50%_50%,black,transparent_82%)]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,41,55,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(31,41,55,0.04)_1px,transparent_1px)] bg-size-[112px_112px]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,106,78,0.038)_1px,transparent_1px),linear-gradient(180deg,rgba(0,106,78,0.034)_1px,transparent_1px)] bg-size-[28px_28px]" />
                <div className="absolute -left-20 top-20 h-105 w-140 bg-[linear-gradient(90deg,rgba(0,106,78,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(0,106,78,0.048)_1px,transparent_1px)] bg-size-[56px_56px]" />
                <div className="absolute bottom-8 right-[-5%] h-130 w-160 bg-[linear-gradient(90deg,rgba(31,41,55,0.052)_1px,transparent_1px),linear-gradient(180deg,rgba(31,41,55,0.045)_1px,transparent_1px)] bg-size-[72px_72px]" />
                <div className="absolute left-[34%] top-[28%] h-65 w-90 bg-[linear-gradient(90deg,rgba(0,106,78,0.038)_1px,transparent_1px),linear-gradient(180deg,rgba(0,106,78,0.034)_1px,transparent_1px)] bg-size-[36px_36px]" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,106,78,0.07),transparent_28%),radial-gradient(circle_at_84%_72%,rgba(31,41,55,0.055),transparent_30%)]" />
            <div className="absolute left-[-12%] top-[-18%] h-130 w-130 rounded-full border-80 border-[#006A4E]/10" />
            <div className="absolute bottom-[-22%] right-[-10%] h-140 w-140 rounded-full border border-[#006A4E]/30" />

            <div className="relative grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
                <section className="flex min-h-70 flex-col justify-between p-8 sm:p-10 lg:p-14">
                    <div className="flex items-center gap-4">
                        <div className="border-l-[6px] border-[#006A4E] pl-4">
                            <div className="text-4xl font-bold leading-none tracking-wide text-[#1F2937]">SGTL</div>
                            <div className="mt-1 h-1 w-16 bg-[#006A4E]" />
                        </div>
                        <div className="h-px flex-1 bg-[#D1D5DB]" />
                    </div>

                    <div className="max-w-md">
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#006A4E]">Sistema de Gerenciamento de Transporte e Logística</p>
                    </div>
                </section>

                <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
                    <form autoComplete="off" className="relative w-full max-w-md border-l border-[#D1D5DB] bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8" onSubmit={handleSubmit}>
                        <div className="absolute -right-6 -top-6 h-12 w-12 border-r-4 border-t-4 border-[#006A4E]" />
                        <div className="mb-7">
                            <p className="text-sm font-semibold uppercase tracking-wide text-[#006A4E]">Acesso</p>
                            <h1 className="mt-2 text-3xl font-semibold text-[#1F2937]">Entrar</h1>
                        </div>

                        <div className="space-y-4">
                            <Field label="E-mail">
                                <Input autoComplete="off" name="sgtl-email" placeholder="usuario@empresa.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                            </Field>
                            <Field label="Senha" error={formError}>
                                <Input autoComplete="new-password" name="sgtl-password" placeholder="Sua senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                            </Field>
                        </div>

                        <div className="mt-6">
                            <Button className="h-11 min-w-36" type="submit" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
