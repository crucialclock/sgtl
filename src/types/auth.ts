export type UserRole = "admin" | "employee";

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
};

export type LoginResponse = {
    token: string;
    user: AuthUser;
};
