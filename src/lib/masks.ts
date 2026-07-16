export function onlyDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatPlate(value: string): string {
    const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);

    if (normalized.length <= 3) return normalized;
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
}

export function normalizePlate(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
