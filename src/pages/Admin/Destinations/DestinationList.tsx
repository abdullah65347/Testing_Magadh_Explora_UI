import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { destinationService } from "@/api/services/destinationService";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function DestinationList() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const list = useQuery({
        queryKey: ["admin", "destinations"],
        queryFn: destinationService.adminList,
    });

    const remove = useMutation({
        mutationFn: (id: number) => destinationService.remove(id),
        onSuccess: () => {
            toast.success("Destination deleted");
            qc.invalidateQueries({ queryKey: ["admin", "destinations"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: "Delete destination?",
            description: `"${name}" will be permanently removed. This cannot be undone.`,
            confirmText: "Delete",
            destructive: true,
        });
        if (ok) remove.mutate(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Destinations</h1>
                    <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} total</p>
                </div>
                <Link
                    to="/admin/destinations/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                    <Plus className="w-4 h-4" /> New Destination
                </Link>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {list.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : list.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load destinations.</div>
                ) : list.data && list.data.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium w-16"></th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Region</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data.map((d) => (
                                <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-2">
                                        {d.heroImageUrl ? (
                                            <img
                                                src={d.heroImageUrl}
                                                alt={d.name}
                                                className="w-12 h-12 rounded object-cover bg-muted"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-muted" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{d.name}</p>
                                        {d.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">{d.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{d.slug}</td>
                                    <td className="px-4 py-3">{d.region || "—"}</td>
                                    <td className="px-4 py-3">
                                        {d.active ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                <Eye className="w-3 h-3" /> Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                                                <EyeOff className="w-3 h-3" /> Hidden
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/destinations/${d.id}/edit`}
                                                className="p-2 rounded-md hover:bg-muted"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(d.id, d.name)}
                                                className="p-2 rounded-md hover:bg-muted text-red-500"
                                                disabled={remove.isPending}
                                                title="Delete"
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
                        <p className="text-muted-foreground mb-4">No destinations yet.</p>
                        <Link
                            to="/admin/destinations/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Create your first destination
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
