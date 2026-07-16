import { apiRequest } from "./api-client";
import type { Vehicle } from "../types/operations";

export type VehicleInput = Omit<Vehicle, "id">;

export const vehiclesService = {
    async list() {
        return (await apiRequest<{ vehicles: Vehicle[] }>("/vehicles")).vehicles;
    },
    async create(input: VehicleInput) {
        return apiRequest<{ vehicle: Vehicle }>("/vehicles", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<VehicleInput>) {
        return apiRequest<{ vehicle: Vehicle }>(`/vehicles/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/vehicles/${id}`, { method: "DELETE" });
    },
};
