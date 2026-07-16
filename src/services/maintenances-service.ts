import { apiRequest } from "./api-client";
import type { Maintenance } from "../types/operations";

export type MaintenanceInput = Omit<Maintenance, "id" | "vehicleLabel">;

export const maintenancesService = {
    async list() {
        return (await apiRequest<{ maintenances: Maintenance[] }>("/maintenances")).maintenances;
    },
    async create(input: MaintenanceInput) {
        return apiRequest<{ maintenance: Maintenance }>("/maintenances", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<MaintenanceInput>) {
        return apiRequest<{ maintenance: Maintenance }>(`/maintenances/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/maintenances/${id}`, { method: "DELETE" });
    },
};
