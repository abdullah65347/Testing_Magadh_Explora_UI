import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { blogService, type BlogInput } from "@/api/services/blogService";
import { uploadService } from "@/api/services/uploadService";
import { categoryService } from "@/api/services/categoryService";
import { cn } from "@/lib/utils";

const EMPTY: BlogInput = {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    author: "",
    publishedAt: undefined,
    published: false,
    categoryIds: [],
};

export default function BlogForm() {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const nav = useNavigate();
    const qc = useQueryClient();

    const [form, setForm] = useState<BlogInput>(EMPTY);
    const [uploading, setUploading] = useState(false);

    const existing = useQuery({
        queryKey: ["admin", "blog", id],
        queryFn: () => blogService.adminGet(Number(id)),
        enabled: isEdit,
    });

    const categoriesQ = useQuery({
        queryKey: ["categories", "all"],
        queryFn: () => categoryService.list(),
    });

    useEffect(() => {
        if (existing.data) {
            setForm({
                slug: existing.data.slug,
                title: existing.data.title,
                excerpt: existing.data.excerpt ?? "",
                content: existing.data.content ?? "",
                coverImageUrl: existing.data.coverImageUrl ?? "",
                author: existing.data.author ?? "",
                publishedAt: existing.data.publishedAt,
                published: existing.data.published,
                categoryIds: (existing.data.categories ?? []).map((c) => c.id),
            });
        }
    }, [existing.data]);

    const toggleCategory = (cid: number) => {
        const current = form.categoryIds ?? [];
        setForm({
            ...form,
            categoryIds: current.includes(cid)
                ? current.filter((x) => x !== cid)
                : [...current, cid],
        });
    };

    const save = useMutation({
        mutationFn: async () => {
            const payload: BlogInput = {
                ...form,
                excerpt: form.excerpt || undefined,
                content: form.content || undefined,
                coverImageUrl: form.coverImageUrl || undefined,
                author: form.author || undefined,
                categoryIds: form.categoryIds ?? [],
            };
            if (isEdit) return blogService.update(Number(id), payload);
            return blogService.create(payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Post updated" : "Post created");
            qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
            nav("/admin/blog");
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadService.upload(file);
            setForm((f) => ({ ...f, coverImageUrl: url }));
            toast.success("Image uploaded");
        } catch (err: any) {
            toast.error(err?.message ?? "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const slugify = (s: string) =>
        s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Link to="/admin/blog" className="p-2 rounded-md hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl font-bold">{isEdit ? "Edit post" : "New post"}</h1>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
                className="space-y-5 bg-card border border-border rounded-lg p-6"
            >
                <Field label="Title *">
                    <input
                        value={form.title}
                        onChange={(e) => {
                            const title = e.target.value;
                            setForm({ ...form, title, slug: form.slug || slugify(title) });
                        }}
                        required
                        className="input"
                    />
                </Field>

                <Field label="Slug *" hint="lowercase-with-dashes; auto-filled from title">
                    <input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                        pattern="[a-z0-9-]+"
                        className="input font-mono"
                    />
                </Field>

                <Field label="Author">
                    <input
                        value={form.author ?? ""}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="input"
                    />
                </Field>

                <Field label="Excerpt" hint="short summary shown on the blog list (max 500 chars)">
                    <textarea
                        value={form.excerpt ?? ""}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        rows={2}
                        maxLength={500}
                        className="input"
                    />
                </Field>

                <Field label="Cover image">
                    {form.coverImageUrl ? (
                        <div className="relative inline-block">
                            <img
                                src={form.coverImageUrl}
                                alt=""
                                className="w-64 h-40 rounded-lg object-cover border border-border"
                            />
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, coverImageUrl: "" })}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted text-sm">
                            <Upload className="w-4 h-4" />
                            {uploading ? "Uploading…" : "Upload image"}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                disabled={uploading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(file);
                                }}
                            />
                        </label>
                    )}
                </Field>

                <Field label="Content" hint="Markdown or HTML — rendered on the post page">
                    <textarea
                        value={form.content ?? ""}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        rows={14}
                        className="input font-mono text-xs"
                    />
                </Field>

                <Field label="Categories" hint="select one or more — appear as chips on the post">
                    {categoriesQ.isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : (categoriesQ.data ?? []).filter((c) => c.active).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No categories yet — create some in{" "}
                            <Link to="/admin/categories" className="text-primary underline">
                                /admin/categories
                            </Link>
                            .
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(categoriesQ.data ?? [])
                                .filter((c) => c.active)
                                .map((c) => {
                                    const selected = (form.categoryIds ?? []).includes(c.id);
                                    return (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() => toggleCategory(c.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                                                selected
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-foreground border-border hover:bg-muted"
                                            )}
                                        >
                                            {c.name}
                                            <span className="ml-1 text-xs opacity-60">
                                                {c.kind?.toLowerCase()}
                                            </span>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </Field>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    Published (visible on public site)
                </label>

                <div className="flex gap-3 pt-2 border-t border-border">
                    <button
                        type="submit"
                        disabled={save.isPending}
                        className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {save.isPending ? "Saving…" : isEdit ? "Update post" : "Create post"}
                    </button>
                    <Link to="/admin/blog" className="px-5 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">
                        Cancel
                    </Link>
                </div>
            </form>

            <style>{`
                .input {
                    width: 100%;
                    height: 36px;
                    padding: 0 10px;
                    border-radius: 6px;
                    border: 1px solid hsl(var(--input));
                    background: hsl(var(--background));
                    font-size: 14px;
                }
                textarea.input { height: auto; padding: 8px 10px; }
            `}</style>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5">
                {label}{hint && <span className="ml-2 text-xs font-normal text-muted-foreground">— {hint}</span>}
            </label>
            {children}
        </div>
    );
}
