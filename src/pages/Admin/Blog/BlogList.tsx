import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { blogService } from "@/api/services/blogService";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function BlogList() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const list = useQuery({ queryKey: ["admin", "blogs"], queryFn: blogService.adminList });

    const remove = useMutation({
        mutationFn: (id: number) => blogService.remove(id),
        onSuccess: () => {
            toast.success("Blog deleted");
            qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const handleDelete = async (id: number, title: string) => {
        const ok = await confirm({
            title: "Delete blog post?",
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
                    <h1 className="text-2xl font-bold">Blog Posts</h1>
                    <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} total</p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                    <Plus className="w-4 h-4" /> New Post
                </Link>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {list.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : list.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load posts.</div>
                ) : list.data && list.data.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium w-16"></th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Published</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.data.map((b) => (
                                <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-2">
                                        {b.coverImageUrl ? (
                                            <img src={b.coverImageUrl} alt="" className="w-12 h-12 rounded object-cover bg-muted" />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-muted" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{b.title}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{b.slug}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{b.author || "—"}</td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                        {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.published ? (
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
                                            <Link to={`/admin/blog/${b.id}/edit`} className="p-2 rounded-md hover:bg-muted" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(b.id, b.title)}
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
                        <p className="text-muted-foreground mb-4">No blog posts yet.</p>
                        <Link
                            to="/admin/blog/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Write your first post
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
