import type { jsPDF } from "jspdf";
import { saveBinaryFile } from "../platform/filesystem";

export async function savePdf(doc: jsPDF, defaultPath: string): Promise<boolean> {
    return saveBinaryFile({
        defaultPath,
        bytes: new Uint8Array(doc.output("arraybuffer")),
        filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
        webFallback: () => doc.save(defaultPath),
    });
}
