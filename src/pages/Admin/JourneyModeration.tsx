import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, Camera, Video, Film, ExternalLink } from "lucide-react";
import { journeyService, resolveMediaUrl, type JourneyPost } from "@/api/services/journeyService";
import { cn } from "@/lib/utils";

type Filter = "pending" | "approved" | "all";

const TYPE_ICON = { photo: Camera, video: Video, reel: Film } as const;

export default function JourneyModeration() {
    const qc = useQueryClient();
    const [filter, setFilter] = useState<Filter>("pending");

    const approvedParam = filter === "all" ? undefined : filter === "approved";

    const listQ = useQuery({
        queryKey: ["admin", "journey", filter],
        queryFn: () => journeyService.adminList(approvedParam, 0, 60),
    });

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["admin", "journey"] });
        qc.invalidateQueries({ queryKey: ["journey-posts"] });
        qc.invalidateQueries({ queryKey: ["admin", "journey-pending"] });
    };

    const approveM = useMutation({
        mutationFn: ({ id, approved }: { id: number; approved: boolean }) => journeyService.approve(id, approved),
        onSuccess: invalidate,
    });
    const deleteM = useMutation({
        mutationFn: (id: number) => journeyService.remove(id),
        onSuccess: invalidate,
    });

    const posts = listQ.data?.content ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Journey Submissions</h1>
                    <p className="text-sm text-muted-foreground">
                        Moderate user-submitted photos, videos and reels from the homepage.
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                    {(["pending", "approved", "all"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-medium capitalize",
                                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {listQ.isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
            ) : posts.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center text-sm text-muted-foreground">
                    No {filter === "all" ? "" : filter} submissions.
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map((p) => (
                        <JourneyCard
                            key={p.id}
                            post={p}
                            onApprove={(approved) => approveM.mutate({ id: p.id, approved })}
                            onDelete={() => deleteM.mutate(p.id)}
                            busy={approveM.isPending || deleteM.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function JourneyCard({
    post,
    onApprove,
    onDelete,
    busy,
}: {
    post: JourneyPost;
    onApprove: (approved: boolean) => void;
    onDelete: () => void;
    busy: boolean;
}) {
    const Icon = TYPE_ICON[post.mediaType] ?? Camera;
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="relative aspect-video bg-muted">
                <img src={resolveMediaUrl(post.mediaUrl)} alt={post.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-foreground/70 text-background text-[10px] uppercase tracking-wider">
                    <Icon className="w-3 h-3" />
                    {post.mediaType}
                </span>
                <span
                    className={cn(
                        "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium",
                        post.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}
                >
                    {post.approved ? "approved" : "pending"}
                </span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <p className="font-medium text-sm">{post.name}</p>
                {post.location && <p className="text-xs text-muted-foreground">{post.location}</p>}
                {post.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.caption}</p>}
                {post.videoUrl && (
                    <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                        Video link <ExternalLink className="w-3 h-3" />
                    </a>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {post.approved ? (
                        <button
                            disabled={busy}
                            onClick={() => onApprove(false)}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-xs py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50"
                        >
                            <X className="w-3.5 h-3.5" /> Unpublish
                        </button>
                    ) : (
                        <button
                            disabled={busy}
                            onClick={() => onApprove(true)}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-xs py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                    )}
                    <button
                        disabled={busy}
                        onClick={onDelete}
                        className="inline-flex items-center justify-center gap-1 text-xs py-1.5 px-2.5 rounded-md border border-border text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
