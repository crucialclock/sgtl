import { apiRequest } from "./api-client";
import type { DailyLog } from "../types/operations";

export type DailyLogInput = Omit<DailyLog, "id" | "vehicleLabel" | "driverName" | "originName" | "destinationName">;

export const dailyLogsService = {
    async list() {
        return (await apiRequest<{ dailyLogs: DailyLog[] }>("/daily-logs")).dailyLogs;
    },
    async create(input: DailyLogInput) {
        return apiRequest<{ dailyLog: DailyLog }>("/daily-logs", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<DailyLogInput>) {
        return apiRequest<{ dailyLog: DailyLog }>(`/daily-logs/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/daily-logs/${id}`, { method: "DELETE" });
    },
};
