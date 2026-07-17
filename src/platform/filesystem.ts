import { isTauriRuntime } from "./environment";

export type SaveBinaryOptions = {
    defaultPath: string;
    bytes: Uint8Array;
    filters?: Array<{ name: string; extensions: string[] }>;
    webFallback: () => void;
};

export async function saveBinaryFile(options: SaveBinaryOptions): Promise<boolean> {
    if (!isTauriRuntime()) {
        options.webFallback();
        return true;
    }

    const [{ save }, { writeFile }] = await Promise.all([
        import("@tauri-apps/plugin-dialog"),
        import("@tauri-apps/plugin-fs"),
    ]);

    const filePath = await save({
        defaultPath: options.defaultPath,
        filters: options.filters,
    });

    if (!filePath) {
        return false;
    }

    await writeFile(filePath, options.bytes);
    return true;
}
