import type { jsPDF } from "jspdf";

export async function savePdf(doc: jsPDF, defaultPath: string): Promise<boolean> {
    if (isTauriRuntime()) {
        const [{ save }, { writeFile }] = await Promise.all([
            import("@tauri-apps/plugin-dialog"),
            import("@tauri-apps/plugin-fs"),
        ]);
        const filePath = await save({
            defaultPath,
            filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
        });

        if (!filePath) {
            return false;
        }

        await writeFile(filePath, new Uint8Array(doc.output("arraybuffer")));
        return true;
    }

    doc.save(defaultPath);
    return true;
}

function isTauriRuntime(): boolean {
    return "__TAURI_INTERNALS__" in window;
}
