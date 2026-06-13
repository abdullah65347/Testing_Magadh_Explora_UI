import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { destinationService, type DestinationInput } from "@/api/services/destinationService";
import { uploadService } from "@/api/services/uploadService";
import {
    EntityTranslationsEditor,
    SUPPORTED_LANGS,
    DESTINATION_TRANSLATABLE_FIELDS,
} from "@/components/admin/EntityTranslationsEditor";

const EMPTY: DestinationInput = {
    slug: "",
    name: "",
    region: "",
    description: "",
    heroImageUrl: "",
    latitude: undefined,
    longitude: undefined,
    active: true,
};

export default function DestinationForm() {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const nav = useNavigate();
    const qc = useQueryClient();

    const [form, setForm] = useState<DestinationInput>(EMPTY);
    const [uploading, setUploading] = useState(false);

    const existing = useQuery({
        queryKey: ["admin", "destinations", id],
        queryFn: async () => {
            const list = await destinationService.adminList();
            return list.find((d) => String(d.id) === id) ?? null;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (existing.data) {
            setForm({
                slug: existing.data.slug,
                name: existing.data.name,
                region: existing.data.region ?? "",
                description: existing.data.description ?? "",
                heroImageUrl: existing.data.heroImageUrl ?? "",
                latitude: existing.data.latitude,
                longitude: existing.data.longitude,
                active: existing.data.active,
            });
        }
    }, [existing.data]);

    const save = useMutation({
        mutationFn: async () => {
            const payload: DestinationInput = {
                ...form,
                region: form.region || undefined,
                description: form.description || undefined,
                heroImageUrl: form.heroImageUrl || undefined,
            };
            if (isEdit) return destinationService.update(Number(id), payload);
            return destinationService.create(payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Destination updated" : "Destination created");
            qc.invalidateQueries({ queryKey: ["admin", "destinations"] });
            nav("/admin/destinations");
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadService.upload(file);
            setForm((f) => ({ ...f, heroImageUrl: url }));
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
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Link to="/admin/destinations" className="p-2 rounded-md hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isEdit ? "Edit destination" : "New destination"}</h1>
                </div>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
                className="space-y-5 bg-card border border-border rounded-lg p-6"
            >
                <Field label="Name *">
                    <input
                        value={form.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            setForm({
                                ...form,
                                name,
                                slug: form.slug || slugify(name),
                            });
                        }}
                        required
                        className="input"
                    />
                </Field>

                <Field label="Slug *" hint="lowercase-with-dashes; auto-filled from name">
                    <input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                        pattern="[a-z0-9-]+"
                        className="input font-mono"
                    />
                </Field>

                <Field label="Region" hint="e.g. Bihar, Nalanda district">
                    <input
                        value={form.region ?? ""}
                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                        className="input"
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={form.description ?? ""}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="input"
                    />
                </Field>

                <Field label="Hero image">
                    {form.heroImageUrl ? (
                        <div className="relative inline-block">
                            <img
                                src={form.heroImageUrl}
                                alt=""
                                className="w-48 h-32 rounded-lg object-cover border border-border"
                            />
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, heroImageUrl: "" })}
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

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Latitude" hint="optional">
                        <input
                            type="number"
                            step="any"
                            value={form.latitude ?? ""}
                            onChange={(e) =>
                                setForm({ ...form, latitude: e.target.value === "" ? undefined : Number(e.target.value) })
                            }
                            className="input"
                        />
                    </Field>
                    <Field label="Longitude" hint="optional">
                        <input
                            type="number"
                            step="any"
                            value={form.longitude ?? ""}
                            onChange={(e) =>
                                setForm({ ...form, longitude: e.target.value === "" ? undefined : Number(e.target.value) })
                            }
                            className="input"
                        />
                    </Field>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    Active (show on public site)
                </label>

                <div className="flex gap-3 pt-2 border-t border-border">
                    <button
                        type="submit"
                        disabled={save.isPending}
                        className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {save.isPending ? "Saving…" : isEdit ? "Update destination" : "Create destination"}
                    </button>
                    <Link
                        to="/admin/destinations"
                        className="px-5 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            {isEdit && existing.data && (
                <div className="mt-6">
                    <EntityTranslationsEditor
                        type="destination"
                        entityId={existing.data.id}
                        languages={SUPPORTED_LANGS}
                        fields={DESTINATION_TRANSLATABLE_FIELDS}
                        baseValues={{
                            name: existing.data.name,
                            region: existing.data.region ?? "",
                            description: existing.data.description ?? "",
                        }}
                    />
                </div>
            )}

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
