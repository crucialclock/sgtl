import { apiDownload, apiRequest } from "./api-client";

export type BackupInfo = {
    fileName: string;
    size: number;
    createdAt: string;
};

export const backupsService = {
    async list() {
        return (await apiRequest<{ backups: BackupInfo[] }>("/backups")).backups;
    },
    async create() {
        return (await apiRequest<{ backup: BackupInfo }>("/backups", { method: "POST", body: {} })).backup;
    },
    async download(fileName: string) {
        return apiDownload(`/backups/${encodeURIComponent(fileName)}/download`);
    },
    async delete(fileName: string) {
        await apiRequest<void>(`/backups/${encodeURIComponent(fileName)}`, { method: "DELETE" });
    },
};
