import { apiRequest } from "./api-client";
import type { Fueling } from "../types/operations";

export type FuelingInput = Omit<Fueling, "id" | "vehicleLabel">;

export const fuelingsService = {
    async list() {
        return (await apiRequest<{ fuelings: Fueling[] }>("/fuelings")).fuelings;
    },
    async create(input: FuelingInput) {
        return apiRequest<{ fueling: Fueling }>("/fuelings", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<FuelingInput>) {
        return apiRequest<{ fueling: Fueling }>(`/fuelings/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/fuelings/${id}`, { method: "DELETE" });
    },
};
