import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contactService, type LeadStatus } from "@/api/services/contactService";
import { cn } from "@/lib/utils";

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "CONVERTED", "CLOSED", "CANCELLED"];

const STATUS_STYLES: Record<LeadStatus, string> = {
    NEW:       "bg-blue-100 text-blue-700",
    CONTACTED: "bg-amber-100 text-amber-700",
    CONVERTED: "bg-green-100 text-green-700",
    CLOSED:    "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function ContactList() {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);
    const size = 20;

    const list = useQuery({
        queryKey: ["admin", "contacts", page, size],
        queryFn: () => contactService.adminList(page, size),
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
            contactService.updateStatus(id, status),
        onSuccess: () => {
            toast.success("Status updated");
            qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {list.isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading…</div>
            ) : list.isError ? (
                <div className="p-8 text-center text-red-500">
                    Failed to load contacts.
                </div>
            ) : list.data && list.data.content.length > 0 ? (
                <>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Contact</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Message</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data.content.map((c) => (
                                <tr key={c.id} className="border-t border-border align-top">
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs">
                                            <a href={`mailto:${c.email}`} className="text-primary hover:underline">
                                                {c.email}
                                            </a>
                                        </div>
                                        {c.mobile && (
                                            <div className="text-xs text-muted-foreground">{c.mobile}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{c.subject || "—"}</td>
                                    <td className="px-4 py-3 max-w-sm">
                                        <p className="text-xs text-muted-foreground line-clamp-3">
                                            {c.message || "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={c.status}
                                            onChange={(e) =>
                                                updateStatus.mutate({
                                                    id: c.id,
                                                    status: e.target.value as LeadStatus,
                                                })
                                            }
                                            disabled={updateStatus.isPending}
                                            className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                                                STATUS_STYLES[c.status]
                                            )}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {list.data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
                            <span className="text-muted-foreground">
                                Page {page + 1} of {list.data.totalPages} · {list.data.totalElements} total
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1 rounded border border-border disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page + 1 >= list.data.totalPages}
                                    className="px-3 py-1 rounded border border-border disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-12 text-center text-muted-foreground">
                    No contact messages yet.
                </div>
            )}
        </div>
    );
}
