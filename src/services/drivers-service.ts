import { apiRequest } from "./api-client";
import type { Driver } from "../types/operations";

export type DriverInput = Omit<Driver, "id">;

export const driversService = {
    async list() {
        return (await apiRequest<{ drivers: Driver[] }>("/drivers")).drivers;
    },
    async create(input: DriverInput) {
        return apiRequest<{ driver: Driver }>("/drivers", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<DriverInput>) {
        return apiRequest<{ driver: Driver }>(`/drivers/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/drivers/${id}`, { method: "DELETE" });
    },
};
