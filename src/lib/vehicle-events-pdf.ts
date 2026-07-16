import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Fueling, Maintenance } from "../types/operations";
import { savePdf } from "./save-pdf";

type ReportKind = "fuelings" | "maintenances";

const colors = {
    primary: [0, 106, 78] as [number, number, number],
    text: [31, 41, 55] as [number, number, number],
    muted: [75, 85, 99] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    surface: [248, 249, 250] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
};

export function exportFuelingsPdf(items: Fueling[]): Promise<boolean> {
    const totalLiters = items.reduce((sum, item) => sum + Math.max(0, item.qtLitrosFinal - item.qtLitrosInicial), 0);
    const totalValue = items.reduce((sum, item) => sum + Math.max(0, item.qtLitrosFinal - item.qtLitrosInicial) * item.valorLitroDiesel, 0);

    return exportVehicleEventPdf("fuelings", items, [
        { label: "Registros", value: String(items.length) },
        { label: "Litros", value: formatNumber(totalLiters) },
        { label: "Total estimado", value: formatCurrency(totalValue) },
    ]);
}

export function exportMaintenancesPdf(items: Maintenance[]): Promise<boolean> {
    const totalValue = items.reduce((sum, item) => sum + item.valor, 0);

    return exportVehicleEventPdf("maintenances", items, [
        { label: "Registros", value: String(items.length) },
        { label: "Total", value: formatCurrency(totalValue) },
        { label: "Veículos", value: String(new Set(items.map((item) => item.vehicleId)).size) },
    ]);
}

function exportVehicleEventPdf(kind: ReportKind, items: Array<Fueling | Maintenance>, summary: Array<{ label: string; value: string }>): Promise<boolean> {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const title = kind === "fuelings" ? "Relatório de abastecimentos" : "Relatório de manutenções";

    drawHeader(doc, pageWidth, margin, title);
    drawSummary(doc, margin, 39, summary);

    autoTable(doc, {
        startY: 64,
        margin: { left: margin, right: margin },
        head: kind === "fuelings"
            ? [["Data", "Veículo", "Funcionário", "Litros inicial", "Litros final", "Litros", "Valor/litro", "Total", "Observações"]]
            : [["Data", "Veículo", "Tipo", "Funcionário", "Valor", "Observações"]],
        body: items.map((item) => kind === "fuelings" ? fuelingRow(item as Fueling) : maintenanceRow(item as Maintenance)),
        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2.4,
            lineColor: colors.border,
            lineWidth: 0.1,
            textColor: colors.text,
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontStyle: "bold",
            fontSize: 7.5,
        },
        alternateRowStyles: { fillColor: [251, 252, 253] },
        didDrawPage: () => drawFooter(doc, pageWidth, pageHeight, margin),
    });

    return savePdf(doc, `SGTL_${kind === "fuelings" ? "Abastecimentos" : "Manutencoes"}_${formatFileDate(new Date())}.pdf`);
}

function fuelingRow(item: Fueling): string[] {
    const liters = Math.max(0, item.qtLitrosFinal - item.qtLitrosInicial);
    return [
        formatDate(item.data),
        item.vehicleLabel || "-",
        item.employeeName || "-",
        formatNumber(item.qtLitrosInicial),
        formatNumber(item.qtLitrosFinal),
        formatNumber(liters),
        formatCurrency(item.valorLitroDiesel),
        formatCurrency(liters * item.valorLitroDiesel),
        item.observacoes || "-",
    ];
}

function maintenanceRow(item: Maintenance): string[] {
    return [
        formatDate(item.data),
        item.vehicleLabel || "-",
        item.tipo,
        item.employeeName || item.responsavel,
        formatCurrency(item.valor),
        item.observacoes || "-",
    ];
}

function drawHeader(doc: jsPDF, pageWidth: number, margin: number, title: string): void {
    doc.setFillColor(...colors.surface);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 4, 32, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colors.primary);
    doc.text("SGTL", margin, 14);
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.text(title, margin, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text(`Emitido em ${new Date().toLocaleString("pt-BR")}`, pageWidth - margin, 14, { align: "right" });
}

function drawSummary(doc: jsPDF, margin: number, y: number, items: Array<{ label: string; value: string }>): void {
    items.forEach((item, index) => {
        const x = margin + index * 72;
        doc.setFillColor(...colors.white);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(x, y, 66, 16, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...colors.muted);
        doc.text(item.label.toUpperCase(), x + 4, y + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.text(item.value, x + 4, y + 12);
    });
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
    doc.setDrawColor(...colors.border);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text("SGTL", margin, pageHeight - 7);
    doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 7, { align: "right" });
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function formatFileDate(value: Date): string {
    return value.toISOString().slice(0, 19).replace(/[-:T]/g, "");
}
