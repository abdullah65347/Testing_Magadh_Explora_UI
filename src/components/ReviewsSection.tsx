import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { reviewService, type Review } from "@/api/services/reviewService";

interface ReviewsSectionProps {
    packageId: number;
    packageSlug: string;
}

function StarRating({
    value,
    onChange,
    size = "md",
    readOnly,
}: {
    value: number;
    onChange?: (n: number) => void;
    size?: "sm" | "md" | "lg";
    readOnly?: boolean;
}) {
    const sz = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange?.(n)}
                    className={cn(
                        sz,
                        readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
                    )}
                >
                    <Star
                        className={cn(
                            sz,
                            n <= value ? "fill-gold text-gold" : "text-muted-foreground/40"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

export function ReviewsSection({ packageId, packageSlug }: ReviewsSectionProps) {
    const { toast } = useToast();
    const qc = useQueryClient();

    const reviewsQ = useQuery({
        queryKey: ["reviews", packageSlug],
        queryFn: () => reviewService.listForPackage(packageSlug),
    });

    const reviews: Review[] = reviewsQ.data ?? [];

    const avg = useMemo(() => {
        if (reviews.length === 0) return 0;
        return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    }, [reviews]);

    const [form, setForm] = useState({
        authorName: "",
        authorEmail: "",
        rating: 5,
        title: "",
        body: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.authorName || !form.body) {
            toast({
                title: "Missing fields",
                description: "Name and review text are required",
                variant: "destructive",
            });
            return;
        }
        setSubmitting(true);
        try {
            await reviewService.submit({
                packageId,
                authorName: form.authorName,
                authorEmail: form.authorEmail || undefined,
                rating: form.rating,
                title: form.title || undefined,
                body: form.body,
            });
            setDone(true);
            toast({
                title: "Thank you!",
                description: "Your review will be visible after moderation.",
            });
            qc.invalidateQueries({ queryKey: ["reviews", packageSlug] });
        } catch (err) {
            console.error(err);
            toast({
                title: "Could not submit",
                description: "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-2">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Traveller Reviews
                </h2>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                        <StarRating value={Math.round(avg)} readOnly />
                        <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                            ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                        </span>
                    </div>
                )}
            </div>

            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((r) => (
                        <div key={r.id} className="bg-card rounded-xl p-5 shadow-soft">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <p className="font-semibold text-foreground">{r.authorName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StarRating value={r.rating} readOnly size="sm" />
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {r.title && (
                                <p className="font-semibold text-foreground mb-1">{r.title}</p>
                            )}
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {r.body}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">
                    Be the first to share your experience on this tour.
                </p>
            )}

            <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    Write a Review
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Reviews are moderated and typically appear within 24 hours.
                </p>

                {done ? (
                    <div className="text-center py-4">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-foreground">Review submitted!</p>
                        <p className="text-sm text-muted-foreground">
                            Pending admin moderation.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Your Rating *</label>
                            <StarRating
                                value={form.rating}
                                onChange={(n) => setForm({ ...form, rating: n })}
                                size="lg"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Your Name *"
                                value={form.authorName}
                                onChange={(e) =>
                                    setForm({ ...form, authorName: e.target.value })
                                }
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Email (optional, not shown)"
                                value={form.authorEmail}
                                onChange={(e) =>
                                    setForm({ ...form, authorEmail: e.target.value })
                                }
                            />
                        </div>
                        <Input
                            placeholder="Review title (optional)"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Tell us about your experience…"
                            rows={4}
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            required
                        />
                        <Button type="submit" disabled={submitting} variant="hero">
                            {submitting ? "Sending…" : "Submit Review"}
                            <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
