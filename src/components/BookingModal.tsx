import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { calculatePrice } from "@/lib/pricing";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageData: {
        destinations: { id: string; days: number }[];
        travelerType: string;
        travelerCount: number;
        packageType: string;
        mealOption: string;
        activities: string[];
        totalPrice: number;
    };
}

const travelerOptions = [
    "solo",
    "couple",
    "family",
    "school",
    "college",
    "corporate",
];

const packageOptions = ["essential", "premium"];
const mealOptions = ["none", "breakfast", "half", "full"];

const activityOptions = [
    "meditation",
    "cooking",
    "photography",
    "spa",
    "adventure",
    "cultural",
];

export function BookingModal({
    isOpen,
    onClose,
    packageData,
}: BookingModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();



    const [editableData, setEditableData] = useState({
        travelerType: "",
        travelerCount: 1,
        packageType: "",
        mealOption: "",
        activities: [] as string[],
    });

    const isFixedCount =
        editableData.travelerType === "solo" ||
        editableData.travelerType === "couple";

    useEffect(() => {
        if (editableData.travelerType === "solo") {
            setEditableData(prev => ({
                ...prev,
                travelerCount: 1,
            }));
        } else if (editableData.travelerType === "couple") {
            setEditableData(prev => ({
                ...prev,
                travelerCount: 2,
            }));
        }
    }, [editableData.travelerType]);


    useEffect(() => {
        if (isOpen && packageData) {
            setEditableData({
                travelerType: packageData.travelerType,
                travelerCount: packageData.travelerCount,
                packageType: packageData.packageType,
                mealOption: packageData.mealOption,
                activities: packageData.activities,
            });
        }
    }, [isOpen, packageData]);


    const pricing = useMemo(() => {
        return calculatePrice({
            destinations: packageData.destinations,
            travelerType: editableData.travelerType,
            travelerCount: editableData.travelerCount,
            packageType: editableData.packageType,
            mealOption: editableData.mealOption,
            activities: editableData.activities,
        });
    }, [editableData, packageData.destinations]);


    const [contact, setContact] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    const toggleActivity = (activity: string) => {
        setEditableData((prev) => ({
            ...prev,
            activities: prev.activities.includes(activity)
                ? prev.activities.filter((a) => a !== activity)
                : [...prev.activities, activity],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contact.name || !contact.email) return;

        setIsSubmitting(true);

        const payload = {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes,

            travelerType: editableData.travelerType,
            travelerCount: editableData.travelerCount,
            packageType: editableData.packageType,
            mealOption: editableData.mealOption,
            activities: editableData.activities,
            destinations: packageData.destinations,
            totalPrice: pricing.total
        };


        try {
            const response = await fetch("http://localhost:8081/mail/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Booking failed");
            }

            setIsSuccess(true);

            toast({
                title: "Success!",
                description: "Your booking request has been sent successfully.",
            });

            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);

        } catch (err) {
            console.error(err);

            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });

        } finally {
            setIsSubmitting(false);
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
                        onClick={onClose}
                        className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl"
                        >
                            {isSuccess ? (
                                <div className="p-8 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.5 }}
                                    >
                                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                                        Booking Request Sent Successfully!
                                    </h3>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="flex justify-between items-center border-b p-6">
                                        <h2 className="text-2xl font-bold">
                                            Review & Confirm Booking
                                        </h2>
                                        <button onClick={onClose}>
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="max-h-[calc(90vh-88px)] overflow-y-auto">
                                        <form onSubmit={handleSubmit} className="p-6 pb-10 space-y-8">

                                            {/* DESTINATIONS */}
                                            <div>
                                                <h3 className="font-semibold mb-2">Destinations</h3>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    {packageData.destinations.map((d) => (
                                                        <li key={d.id}>
                                                            {d.id.replace("-", " ")} – {d.days} day(s)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* TRAVEL INFO */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">
                                                        Traveler Type
                                                    </label>
                                                    <select
                                                        value={editableData.travelerType}
                                                        onChange={(e) =>
                                                            setEditableData({
                                                                ...editableData,
                                                                travelerType: e.target.value,
                                                            })
                                                        }
                                                        className="w-full h-10 px-3 rounded-md border"
                                                    >
                                                        {travelerOptions.map((t) => (
                                                            <option key={t} value={t}>
                                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium">
                                                        Number of Travelers
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        disabled={isFixedCount}
                                                        value={editableData.travelerCount}
                                                        onChange={(e) => {
                                                            const value = Number(e.target.value);
                                                            if (value >= 1 && value <= 20) {
                                                                setEditableData({
                                                                    ...editableData,
                                                                    travelerCount: value,
                                                                });
                                                            }
                                                        }}
                                                    />

                                                </div>
                                            </div>

                                            {/* PACKAGE */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">
                                                        Package Type
                                                    </label>
                                                    <select
                                                        value={editableData.packageType}
                                                        onChange={(e) =>
                                                            setEditableData({
                                                                ...editableData,
                                                                packageType: e.target.value,
                                                            })
                                                        }
                                                        className="w-full h-10 px-3 rounded-md border"
                                                    >
                                                        {packageOptions.map((p) => (
                                                            <option key={p} value={p}>
                                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium">
                                                        Meal Plan
                                                    </label>
                                                    <select
                                                        value={editableData.mealOption}
                                                        onChange={(e) =>
                                                            setEditableData({
                                                                ...editableData,
                                                                mealOption: e.target.value,
                                                            })
                                                        }
                                                        className="w-full h-10 px-3 rounded-md border"
                                                    >
                                                        {mealOptions.map((m) => (
                                                            <option key={m} value={m}>
                                                                {m}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* ACTIVITIES */}
                                            <div>
                                                <h3 className="font-semibold mb-2">Activities</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {activityOptions.map((a) => (
                                                        <button
                                                            type="button"
                                                            key={a}
                                                            onClick={() => toggleActivity(a)}
                                                            className={`px-3 py-1.5 rounded-full text-sm ${editableData.activities.includes(a)
                                                                ? "bg-primary text-white"
                                                                : "bg-muted"
                                                                }`}
                                                        >
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* TOTAL */}
                                            <div className="border-t pt-4 text-lg font-semibold">
                                                Total: ₹{pricing.total.toLocaleString()}
                                            </div>

                                            {/* CONTACT DETAILS */}
                                            <div className="space-y-4 border-t pt-6">
                                                <h3 className="font-semibold">Your Details</h3>

                                                <Input
                                                    placeholder="Full Name *"
                                                    value={contact.name}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, name: e.target.value })
                                                    }
                                                    required
                                                />

                                                <Input
                                                    type="email"
                                                    placeholder="Email Address *"
                                                    value={contact.email}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, email: e.target.value })
                                                    }
                                                    required
                                                />

                                                <PhoneInput
                                                    placeholder="Phone Number"
                                                    value={contact.phone}
                                                    onChange={(v) =>
                                                        setContact({ ...contact, phone: v })
                                                    }
                                                />

                                                <Textarea
                                                    placeholder="Special requests, accessibility needs, or notes..."
                                                    value={contact.notes}
                                                    onChange={(e) =>
                                                        setContact({ ...contact, notes: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Processing..." : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Confirm Booking
                                                    </>
                                                )}
                                            </Button>

                                        </form>
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
