import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { packageService } from "@/api/services/packageService";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function PackageList() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const list = useQuery({ queryKey: ["admin", "packages"], queryFn: packageService.adminList });

    const remove = useMutation({
        mutationFn: (id: number) => packageService.remove(id),
        onSuccess: () => {
            toast.success("Package deleted");
            qc.invalidateQueries({ queryKey: ["admin", "packages"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const handleDelete = async (id: number, title: string) => {
        const ok = await confirm({
            title: "Delete package?",
            description: `"${title}" will be permanently removed. This cannot be undone.`,
            confirmText: "Delete",
            destructive: true,
        });
        if (ok) remove.mutate(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Packages</h1>
                    <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} total</p>
                </div>
                <Link
                    to="/admin/packages/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                    <Plus className="w-4 h-4" /> New Package
                </Link>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {list.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : list.isError ? (
                    <div className="p-8 text-center text-red-500">
                        Failed to load packages. Is the backend running?
                    </div>
                ) : list.data && list.data.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Mode</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data.map((p) => (
                                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{p.title}</p>
                                        {p.summary && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">{p.summary}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{p.mode}</span>
                                    </td>
                                    <td className="px-4 py-3">₹{Number(p.priceInr).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        {p.published ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                <Eye className="w-3 h-3" /> Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                                                <EyeOff className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/packages/${p.id}/edit`}
                                                className="p-2 rounded-md hover:bg-muted"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id, p.title)}
                                                className="p-2 rounded-md hover:bg-muted text-red-500"
                                                title="Delete"
                                                disabled={remove.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">No packages yet.</p>
                        <Link
                            to="/admin/packages/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Create your first package
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
