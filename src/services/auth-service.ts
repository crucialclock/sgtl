import type { AuthUser, LoginResponse } from "../types/auth";
import { apiRequest, clearStoredToken, getStoredToken, setStoredToken } from "./api-client";

export async function login(email: string, password: string): Promise<LoginResponse> {
    const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
    });

    setStoredToken(result.token);
    return result;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    if (!getStoredToken()) {
        return null;
    }

    try {
        const result = await apiRequest<{ user: AuthUser }>("/auth/me");
        return result.user;
    } catch {
        clearStoredToken();
        return null;
    }
}

export function logout(): void {
    clearStoredToken();
}

export function getToken(): string | null {
    return getStoredToken();
}
