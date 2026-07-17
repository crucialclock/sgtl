import { API_BASE_URL, buildApiUrl } from "../platform/api";
import { storage } from "../platform/storage";

export { API_BASE_URL };

const TOKEN_KEY = "sgtl.auth.token";

type RequestOptions = {
    method?: string;
    body?: unknown;
    auth?: boolean;
};

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}

export function getStoredToken(): string | null {
    return storage.get(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
    storage.set(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
    storage.remove(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers();
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);

    if (body) {
        headers.set("Content-Type", "application/json");
    }

    const token = getStoredToken();
    if (options.auth !== false && token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;
    try {
        response = await fetch(buildApiUrl(path), {
            method: options.method || "GET",
            headers,
            body,
        });
    } catch {
        throw new ApiError(0, "Não foi possível conectar à API.");
    }

    const data = (await response.json().catch(() => ({}))) as { message?: string };

    if (!response.ok) {
        if (response.status === 401) {
            clearStoredToken();
        }

        throw new ApiError(response.status, data.message || "Erro na requisição.");
    }

    return data as T;
}

export async function apiDownload(path: string): Promise<Blob> {
    const headers = new Headers();
    const token = getStoredToken();

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;
    try {
        response = await fetch(buildApiUrl(path), { headers });
    } catch {
        throw new ApiError(0, "Não foi possível conectar à API.");
    }

    if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new ApiError(response.status, data.message || "Erro na requisição.");
    }

    return response.blob();
}
