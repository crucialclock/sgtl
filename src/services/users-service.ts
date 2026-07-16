import { apiRequest } from "./api-client";
import type { AuthUser, UserRole } from "../types/auth";

export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
};

export type UpdateUserInput = Partial<Pick<AuthUser, "name" | "email" | "role" | "isActive">>;

export const usersService = {
    async list() {
        return (await apiRequest<{ users: AuthUser[] }>("/users")).users;
    },
    async create(input: CreateUserInput) {
        return apiRequest<{ user: AuthUser }>("/users", { method: "POST", body: input });
    },
    async update(id: number, input: UpdateUserInput) {
        return apiRequest<{ user: AuthUser }>(`/users/${id}`, { method: "PATCH", body: input });
    },
    async updatePassword(id: number, password: string) {
        return apiRequest<void>(`/users/${id}/password`, { method: "PATCH", body: { password } });
    },
};
