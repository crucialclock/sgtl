import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyLog } from "../types/operations";
import { savePdf } from "./save-pdf";

type Rgb = [number, number, number];

type PdfFilters = {
    search: string;
    vehicle: string;
    driver: string;
    dateFrom: string;
    dateTo: string;
};

const colors = {
    primary: [0, 106, 78] as Rgb,
    text: [31, 41, 55] as Rgb,
    muted: [75, 85, 99] as Rgb,
    border: [229, 231, 235] as Rgb,
    surface: [248, 249, 250] as Rgb,
    white: [255, 255, 255] as Rgb,
};

export async function exportDailyLogsPdf(dailyLogs: DailyLog[], filters: PdfFilters): Promise<boolean> {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const generatedAt = new Date();
    const totalFreight = dailyLogs.reduce((sum, item) => sum + Number(item.valorFrete || 0), 0);
    const totalDistance = dailyLogs.reduce((sum, item) => sum + Math.max(0, Number(item.kmChegada) - Number(item.kmSaida)), 0);

    drawHeader(doc, pageWidth, margin, generatedAt);
    drawSummary(doc, margin, 39, [
        { label: "Registros", value: String(dailyLogs.length) },
        { label: "Total de frete", value: formatCurrency(totalFreight) },
        { label: "Distância total", value: `${formatNumber(totalDistance)} km` },
        { label: "Período", value: formatPeriod(filters.dateFrom, filters.dateTo) },
    ]);
    drawFilters(doc, pageWidth, margin, 64, filters);

    autoTable(doc, {
        startY: 82,
        margin: { left: margin, right: margin },
        head: [["Data", "Nota", "Veículo", "Funcionário", "Origem", "Destino", "KM", "Dist.", "Frete"]],
        body: dailyLogs.map((item) => [
            formatDate(item.data),
            item.nrNota || "-",
            item.vehicleLabel || "-",
            item.driverName || "-",
            item.originName || "-",
            item.destinationName || "-",
            `${formatNumber(item.kmSaida)} -> ${formatNumber(item.kmChegada)}`,
            `${formatNumber(Math.max(0, item.kmChegada - item.kmSaida))} km`,
            formatCurrency(item.valorFrete),
        ]),
        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: { top: 2.6, right: 2.2, bottom: 2.6, left: 2.2 },
            lineColor: colors.border,
            lineWidth: 0.1,
            textColor: colors.text,
            overflow: "linebreak",
            valign: "middle",
        },
        headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 7.5,
            fontStyle: "bold",
            halign: "left",
        },
        alternateRowStyles: {
            fillColor: [251, 252, 253],
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 22 },
            2: { cellWidth: 30 },
            3: { cellWidth: 38 },
            4: { cellWidth: 38 },
            5: { cellWidth: 38 },
            6: { cellWidth: 28, halign: "right" },
            7: { cellWidth: 22, halign: "right" },
            8: { cellWidth: 28, halign: "right" },
        },
        didDrawPage: () => drawFooter(doc, pageWidth, pageHeight, margin),
    });

    return savePdf(doc, `SGTL_Diarias_${formatFileDate(generatedAt)}.pdf`);
}

function drawHeader(doc: jsPDF, pageWidth: number, margin: number, generatedAt: Date): void {
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
    doc.text("Relatório de diárias", margin, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text("Sistema de Gerenciamento de Transporte Logística", margin + 38, 14);
    doc.text(`Emitido em ${generatedAt.toLocaleString("pt-BR")}`, pageWidth - margin, 14, { align: "right" });
}

function drawSummary(doc: jsPDF, margin: number, y: number, items: Array<{ label: string; value: string }>): void {
    const gap = 4;
    const width = 64;

    items.forEach((item, index) => {
        const x = margin + index * (width + gap);
        doc.setFillColor(...colors.white);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(x, y, width, 16, 1.5, 1.5, "FD");
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

function drawFilters(doc: jsPDF, pageWidth: number, margin: number, y: number, filters: PdfFilters): void {
    const activeFilters = [
        filters.search.trim() ? `Busca: ${filters.search.trim()}` : null,
        filters.vehicle !== "all" ? `Veículo ID: ${filters.vehicle}` : null,
        filters.driver !== "all" ? `Funcionário ID: ${filters.driver}` : null,
    ].filter(Boolean);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text(activeFilters.length ? activeFilters.join("   |   ") : "Sem filtros adicionais", margin, y);

    doc.setDrawColor(...colors.border);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
    const page = doc.getNumberOfPages();
    doc.setDrawColor(...colors.border);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text("SGTL", margin, pageHeight - 7);
    doc.text(`Página ${page}`, pageWidth - margin, pageHeight - 7, { align: "right" });
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

function formatPeriod(dateFrom: string, dateTo: string): string {
    if (!dateFrom && !dateTo) return "Todos";
    if (dateFrom && !dateTo) return `Desde ${formatDate(dateFrom)}`;
    if (!dateFrom && dateTo) return `Até ${formatDate(dateTo)}`;
    return `${formatDate(dateFrom)} a ${formatDate(dateTo)}`;
}

function formatFileDate(value: Date): string {
    return value.toISOString().slice(0, 19).replace(/[-:T]/g, "");
}
