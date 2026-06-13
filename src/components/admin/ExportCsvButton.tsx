import { Download } from "lucide-react";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { cn } from "@/lib/utils";

interface Props<T> {
    filename: string;
    rows: T[];
    columns: CsvColumn<T>[];
    className?: string;
    label?: string;
}

/** Small "Export CSV" button. Disabled when there are no rows. */
export default function ExportCsvButton<T>({ filename, rows, columns, className, label = "CSV" }: Props<T>) {
    const empty = rows.length === 0;
    return (
        <button
            type="button"
            disabled={empty}
            onClick={() => downloadCsv(filename, rows, columns)}
            title={empty ? "Nothing to export yet" : "Export to CSV"}
            className={cn(
                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
                className
            )}
        >
            <Download className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}
