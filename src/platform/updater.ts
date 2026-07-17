import { platform } from "./environment";

export function canUseNativeUpdater(): boolean {
    return platform.isDesktop;
}

export async function checkForUpdates(): Promise<{ available: boolean; message: string }> {
    if (!canUseNativeUpdater()) {
        return { available: false, message: "Atualizações nativas disponíveis apenas no desktop." };
    }

    return { available: false, message: "Atualizador desktop não configurado." };
}
