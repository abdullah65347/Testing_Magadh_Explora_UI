/**
 * Minimal client-side CSV export. Builds a CSV from an array of rows using a
 * column spec, then triggers a browser download. No dependencies.
 */

export interface CsvColumn<T> {
    header: string;
    /** Cell value — string/number/null. Objects are JSON-stringified. */
    value: (row: T) => string | number | null | undefined;
}

function escapeCell(v: string | number | null | undefined): string {
    if (v == null) return "";
    const s = String(v);
    // Quote if it contains comma, quote, or newline; double up inner quotes.
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
    const head = columns.map((c) => escapeCell(c.header)).join(",");
    const body = rows
        .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
        .join("\r\n");
    return body ? `${head}\r\n${body}` : head;
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
    const csv = toCsv(rows, columns);
    // BOM so Excel detects UTF-8 (₹ and accents render correctly).
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
