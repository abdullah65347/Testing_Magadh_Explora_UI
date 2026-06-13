import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Camera, Video, Film, Upload, Play, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { ShareJourneyModal } from "@/components/ShareJourneyModal";
import {
    journeyService,
    resolveMediaUrl,
    type JourneyPost,
    type JourneyMediaType,
} from "@/api/services/journeyService";
import {
    bodhGayaSharedImg,
    nalandaUniversityImg,
    rajgirMainImg,
    ashokanPillarVaishaliImg,
    golGharPatnaImg,
    rajgir1Img,
    sunsetBodhgayaImg,
    walkingNalandaImg,
    meditationRajgirImg,
} from "@/assets/assets";

/** Curated fallback shown until real approved submissions exist. */
function mock(id: number, url: string, name: string, location: string, mediaType: JourneyMediaType, likes: number): JourneyPost {
    return { id: -id, name, location, caption: null, mediaType, mediaUrl: url, videoUrl: null, likes, approved: true, createdAt: "" };
}

const FALLBACK: Record<JourneyMediaType, JourneyPost[]> = {
    photos: [], // placeholder, set below
    videos: [],
    reels: [],
} as unknown as Record<JourneyMediaType, JourneyPost[]>;

FALLBACK.photo = [
    mock(1, bodhGayaSharedImg, "Amit K.", "Bodh Gaya", "photo", 234),
    mock(2, nalandaUniversityImg, "Sarah M.", "Nalanda", "photo", 189),
    mock(3, rajgirMainImg, "Raj P.", "Rajgir", "photo", 156),
    mock(4, rajgir1Img, "Emily C.", "Rajgir", "photo", 203),
    mock(5, ashokanPillarVaishaliImg, "Chen W.", "Vaishali", "photo", 178),
    mock(6, golGharPatnaImg, "Priya S.", "Patna", "photo", 145),
];
FALLBACK.video = [
    mock(7, sunsetBodhgayaImg, "Travel Monk", "Bodh Gaya", "video", 1250),
    mock(8, walkingNalandaImg, "Bihar Explorer", "Nalanda", "video", 890),
    mock(9, meditationRajgirImg, "Spiritual Journey", "Rajgir", "video", 1520),
];
FALLBACK.reel = [
    mock(10, sunsetBodhgayaImg, "@bihartravel", "Bodh Gaya", "reel", 5600),
    mock(11, bodhGayaSharedImg, "@spiritualseeker", "Bodh Gaya", "reel", 8200),
    mock(12, rajgir1Img, "@wanderlust_in", "Rajgir", "reel", 4300),
    mock(13, ashokanPillarVaishaliImg, "@travelgram", "Vaishali", "reel", 9100),
];

type TabType = JourneyMediaType;

export function ShareJourneySection() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>("photo");
    const [modalOpen, setModalOpen] = useState(false);

    const postsQ = useQuery({
        queryKey: ["journey-posts", "public"],
        queryFn: () => journeyService.listPublic(),
        staleTime: 1000 * 60 * 2,
        retry: false,
    });

    const real = postsQ.data ?? [];
    const realByType = (type: TabType) => real.filter((p) => p.mediaType === type);

    const tabs = [
        { id: "photo" as TabType, icon: Camera, label: t.shareJourney.photos },
        { id: "video" as TabType, icon: Video, label: t.shareJourney.videos },
        { id: "reel" as TabType, icon: Film, label: t.shareJourney.reels },
    ];

    // Real content if any exists for this tab, otherwise the curated fallback.
    const realItems = realByType(activeTab);
    const items = realItems.length > 0 ? realItems : FALLBACK[activeTab];

    const openVideo = (post: JourneyPost) => {
        if (post.videoUrl) window.open(post.videoUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <section className="py-24 bg-gradient-warm relative overflow-hidden">
            <div className="absolute inset-0 pattern-heritage opacity-30" />

            <div className="container mx-auto px-4 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Share2 className="w-4 h-4" />
                        {t.shareJourney.badge}
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        {t.shareJourney.title}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t.shareJourney.subtitle}
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center gap-2 mb-8"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-medium"
                                    : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Content Grid */}
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {activeTab === "photo" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {items.map((photo, index) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer"
                                >
                                    <img
                                        src={resolveMediaUrl(photo.mediaUrl)}
                                        alt={`${photo.location ?? ""} by ${photo.name}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-primary-foreground text-sm font-medium">{photo.name}</p>
                                        {photo.location && <p className="text-primary-foreground/70 text-xs">{photo.location}</p>}
                                        <div className="flex items-center gap-1 mt-1">
                                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                            <span className="text-primary-foreground/80 text-xs">{photo.likes}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === "video" && (
                        <div className="grid md:grid-cols-3 gap-6">
                            {items.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    onClick={() => openVideo(video)}
                                    className="group relative rounded-xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer bg-background"
                                >
                                    <div className="relative aspect-video">
                                        <img
                                            src={resolveMediaUrl(video.mediaUrl)}
                                            alt={video.caption ?? video.location ?? "Shared video"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Play className="w-7 h-7 text-primary-foreground ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-foreground mb-1 truncate">
                                            {video.caption || video.location || "Shared video"}
                                        </h4>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{video.name}</span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                                                {video.likes.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === "reel" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {items.map((reel, index) => (
                                <motion.div
                                    key={reel.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => openVideo(reel)}
                                    className="group relative aspect-[9/16] rounded-xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer"
                                >
                                    <img
                                        src={resolveMediaUrl(reel.mediaUrl)}
                                        alt={`Reel by ${reel.name}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                                    <div className="absolute top-3 right-3">
                                        <Film className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-primary-foreground font-medium text-sm">{reel.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                                            <span className="text-primary-foreground/80 text-sm">{reel.likes.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {reel.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upload CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-background border border-border shadow-soft">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-primary" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="font-display text-lg font-bold text-foreground">
                                {t.shareJourney.uploadTitle}
                            </h4>
                            <p className="text-muted-foreground text-sm max-w-md">
                                {t.shareJourney.uploadSubtitle}
                            </p>
                        </div>
                        <Button variant="default" size="lg" className="shrink-0" onClick={() => setModalOpen(true)}>
                            <Camera className="w-4 h-4 mr-2" />
                            {t.shareJourney.shareNow}
                        </Button>
                    </div>
                </motion.div>
            </div>

            <ShareJourneyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultType={activeTab} />
        </section>
    );
}
