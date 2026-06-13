import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reviewService } from "@/api/services/reviewService";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function AdminReviews() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
    const size = 20;

    const approvedFilter =
        filter === "pending" ? false : filter === "approved" ? true : undefined;

    const list = useQuery({
        queryKey: ["admin", "reviews", filter, page, size],
        queryFn: () => reviewService.adminList(page, size, approvedFilter),
    });

    const approveMut = useMutation({
        mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
            reviewService.approve(id, approved),
        onSuccess: () => {
            toast.success("Review updated");
            qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Update failed"),
    });

    const deleteMut = useMutation({
        mutationFn: (id: number) => reviewService.remove(id),
        onSuccess: () => {
            toast.success("Review deleted");
            qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reviews</h1>
                <div className="flex gap-2">
                    {(["pending", "approved", "all"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(0);
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm capitalize transition-colors",
                                filter === f
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {list.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : list.isError ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load reviews.
                    </div>
                ) : list.data && list.data.content.length > 0 ? (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="p-3">Author</th>
                                    <th className="p-3">Rating</th>
                                    <th className="p-3">Title / Body</th>
                                    <th className="p-3">Pkg ID</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Created</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.data.content.map((r) => (
                                    <tr key={r.id} className="border-t border-border">
                                        <td className="p-3 align-top">
                                            <p className="font-medium">{r.authorName}</p>
                                            {r.authorEmail && (
                                                <p className="text-xs text-muted-foreground">
                                                    {r.authorEmail}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 align-top">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        className={cn(
                                                            "w-3.5 h-3.5",
                                                            n <= r.rating
                                                                ? "fill-gold text-gold"
                                                                : "text-muted-foreground/30"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 align-top max-w-md">
                                            {r.title && (
                                                <p className="font-semibold">{r.title}</p>
                                            )}
                                            <p className="text-muted-foreground line-clamp-3">
                                                {r.body}
                                            </p>
                                        </td>
                                        <td className="p-3 align-top">{r.packageId}</td>
                                        <td className="p-3 align-top">
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded text-xs font-medium",
                                                    r.approved
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                )}
                                            >
                                                {r.approved ? "Approved" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="p-3 align-top text-xs text-muted-foreground">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 align-top text-right">
                                            <div className="flex gap-1 justify-end">
                                                {r.approved ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            approveMut.mutate({
                                                                id: r.id,
                                                                approved: false,
                                                            })
                                                        }
                                                    >
                                                        <X className="w-3.5 h-3.5 mr-1" />
                                                        Unapprove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            approveMut.mutate({
                                                                id: r.id,
                                                                approved: true,
                                                            })
                                                        }
                                                    >
                                                        <Check className="w-3.5 h-3.5 mr-1" />
                                                        Approve
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={async () => {
                                                        const ok = await confirm({
                                                            title: "Delete review?",
                                                            description: "This review will be permanently removed.",
                                                            confirmText: "Delete",
                                                            destructive: true,
                                                        });
                                                        if (ok) deleteMut.mutate(r.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between p-3 border-t border-border text-sm">
                            <span className="text-muted-foreground">
                                Page {list.data.number + 1} of {list.data.totalPages || 1}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                >
                                    Prev
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={list.data.number >= list.data.totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        No reviews to show.
                    </div>
                )}
            </div>
        </div>
    );
}
