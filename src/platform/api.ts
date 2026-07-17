import { appConfig } from "../config/app-config";

export const API_BASE_URL = appConfig.apiUrl;

export function buildApiUrl(path: string): string {
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
