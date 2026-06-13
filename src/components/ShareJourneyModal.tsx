import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle, Camera, Video, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { journeyService, type JourneyMediaType } from "@/api/services/journeyService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: JourneyMediaType;
}

const TYPES: { id: JourneyMediaType; icon: typeof Camera; label: string }[] = [
    { id: "photo", icon: Camera, label: "Photo" },
    { id: "video", icon: Video, label: "Video" },
    { id: "reel", icon: Film, label: "Reel" },
];

const MAX_BYTES = 10 * 1024 * 1024;

export function ShareJourneyModal({ isOpen, onClose, defaultType = "photo" }: Props) {
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState<JourneyMediaType>(defaultType);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [caption, setCaption] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const reset = () => {
        setType(defaultType);
        setName(""); setLocation(""); setCaption(""); setVideoUrl("");
        setFile(null); setPreview(null); setSubmitting(false); setSuccess(false);
    };

    const close = () => { reset(); onClose(); };

    const onPickFile = (f: File | null) => {
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            toast({ title: "Image only", description: "Please choose an image (use the thumbnail for videos/reels).", variant: "destructive" });
            return;
        }
        if (f.size > MAX_BYTES) {
            toast({ title: "Too large", description: "Images must be under 10MB.", variant: "destructive" });
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast({ title: "Name required", description: "Tell us who's sharing.", variant: "destructive" });
            return;
        }
        if (!file) {
            toast({ title: "Add an image", description: type === "photo" ? "Choose a photo to share." : "Add a thumbnail image.", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        try {
            const mediaUrl = await journeyService.uploadMedia(file);
            await journeyService.submit({
                name: name.trim(),
                location: location.trim() || undefined,
                caption: caption.trim() || undefined,
                mediaType: type,
                mediaUrl,
                videoUrl: videoUrl.trim() || undefined,
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            toast({
                title: "Upload failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={close}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl"
                        >
                            {success ? (
                                <div className="p-8 text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                                        Thank you for sharing! 🙏
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Your submission is in for review. Once approved, it'll appear in the gallery.
                                    </p>
                                    <Button onClick={close}>Done</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
                                        <div>
                                            <h2 className="text-2xl font-display font-bold text-foreground">Share Your Journey</h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Submit a photo, video or reel from your Bihar trip.
                                            </p>
                                        </div>
                                        <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Type selector */}
                                        <div className="flex gap-2">
                                            {TYPES.map((tp) => (
                                                <button
                                                    key={tp.id}
                                                    onClick={() => setType(tp.id)}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                                                        type === tp.id
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    <tp.icon className="w-4 h-4" />
                                                    {tp.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* File picker */}
                                        <div>
                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                                            />
                                            {preview ? (
                                                <div className="relative rounded-lg overflow-hidden border border-border">
                                                    <img src={preview} alt="preview" className="w-full max-h-56 object-cover" />
                                                    <button
                                                        onClick={() => { setFile(null); setPreview(null); }}
                                                        className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1.5 hover:bg-foreground"
                                                        aria-label="Remove image"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileRef.current?.click()}
                                                    className="w-full border-2 border-dashed border-border rounded-lg py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                                >
                                                    <ImageIcon className="w-8 h-8" />
                                                    <span className="text-sm font-medium">
                                                        {type === "photo" ? "Choose a photo" : "Choose a thumbnail image"}
                                                    </span>
                                                    <span className="text-xs">JP, PNG, WEBP · up to 10MB</span>
                                                </button>
                                            )}
                                        </div>

                                        {(type === "video" || type === "reel") && (
                                            <div>
                                                <label className="text-sm font-medium text-foreground">Video link (optional)</label>
                                                <Input
                                                    placeholder="YouTube / Instagram / Drive link"
                                                    value={videoUrl}
                                                    onChange={(e) => setVideoUrl(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}

                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-foreground">Your name *</label>
                                                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" maxLength={120} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground">Location</label>
                                                <Input placeholder="e.g. Bodh Gaya" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" maxLength={160} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-foreground">Caption</label>
                                            <Textarea
                                                placeholder="Share a little about this moment…"
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                                className="mt-1"
                                                rows={3}
                                                maxLength={500}
                                            />
                                        </div>

                                        <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
                                            {submitting ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
                                            ) : (
                                                <><Upload className="w-4 h-4 mr-2" /> Submit for review</>
                                            )}
                                        </Button>
                                        <p className="text-xs text-center text-muted-foreground">
                                            Submissions are reviewed before appearing publicly.
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
