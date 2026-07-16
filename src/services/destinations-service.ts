import { apiRequest } from "./api-client";
import type { Destination } from "../types/operations";

export type DestinationInput = Omit<Destination, "id">;

export const destinationsService = {
    async list() {
        return (await apiRequest<{ destinations: Destination[] }>("/destinations")).destinations;
    },
    async create(input: DestinationInput) {
        return apiRequest<{ destination: Destination }>("/destinations", { method: "POST", body: input });
    },
    async update(id: number, input: Partial<DestinationInput>) {
        return apiRequest<{ destination: Destination }>(`/destinations/${id}`, { method: "PATCH", body: input });
    },
    async remove(id: number) {
        return apiRequest<void>(`/destinations/${id}`, { method: "DELETE" });
    },
};
