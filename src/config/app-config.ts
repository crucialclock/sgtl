const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const appConfig = {
    name: import.meta.env.VITE_APP_NAME || "SGTL",
    fullName: "Sistema de Gestão de Transporte e Logística",
    version: import.meta.env.VITE_APP_VERSION || "0.1.0",
    apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL || "http://sgtlapi.blazebr.com:25817"),
    environment: import.meta.env.MODE,
    flags: {
        desktopFileSave: true,
    },
} as const;
