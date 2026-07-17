export type PlatformKind = "desktop" | "web";

export function isTauriRuntime(): boolean {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getPlatform(): PlatformKind {
    return isTauriRuntime() ? "desktop" : "web";
}

export const platform = {
    kind: getPlatform(),
    isDesktop: isTauriRuntime(),
    isWeb: !isTauriRuntime(),
};
