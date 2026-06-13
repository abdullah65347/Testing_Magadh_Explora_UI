import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Hotel,
  Utensils,
  MapPin,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Send,
  CheckCircle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { calculatePrice } from "@/lib/pricing";
import { SEO } from "@/components/SEO";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { destinationService, type Destination } from "@/api/services/destinationService";
import { quoteService } from "@/api/services/quoteService";
import {
  SoloIcon,
  CoupleIcon,
  FamilyIcon,
  SchoolIcon,
  CollegeIcon,
  CorporateIcon,
  customizeCover,
} from "@/assets/assets";

const SUGGESTED_DAYS_BY_SLUG: Record<string, number> = {
  "bodh-gaya": 2,
  rajgir: 2,
  nalanda: 1,
  pawapuri: 1,
  vaishali: 1,
  kesariya: 1,
};

const travelerTypes = [
  { id: "solo", name: "Solo Traveler", icon: SoloIcon },
  { id: "couple", name: "Couple", icon: CoupleIcon },
  { id: "family", name: "Family", icon: FamilyIcon },
  { id: "school", name: "School Group", icon: SchoolIcon },
  { id: "college", name: "College Group", icon: CollegeIcon },
  { id: "corporate", name: "Corporate", icon: CorporateIcon },
];

const packageTypes = [
  {
    id: "essential",
    name: "Essential",
    features: [
      "Budget hotels (2-3 star)",
      "Basic transportation",
      "Standard guide (optional)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    features: [
      "Luxury hotels (4-5 star)",
      "Premium transportation",
      "Expert multilingual guide",
      "All meals included",
      "VIP experiences",
    ],
  },
];

const mealOptions = [
  { id: "none", name: "No Meals", multiplier: 0 },
  { id: "breakfast", name: "Breakfast Only", multiplier: 0.15 },
  { id: "half", name: "Half Board (2 meals)", multiplier: 0.3 },
  { id: "full", name: "Full Board (3 meals)", multiplier: 0.5 },
];

const activities = [
  { id: "meditation", name: "Meditation Session", price: 1500 },
  { id: "cooking", name: "Cooking Workshop", price: 2000 },
  { id: "photography", name: "Photography Tour", price: 2500 },
  { id: "spa", name: "Spa & Wellness", price: 3500 },
  { id: "adventure", name: "Adventure Activities", price: 3000 },
  { id: "cultural", name: "Cultural Show", price: 1500 },
];

interface SelectedDest {
  id: string;
  slug: string;
  name: string;
  days: number;
}

export default function CustomizePage() {
  const [step, setStep] = useState(1);
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDest[]>([]);
  const [travelerType, setTravelerType] = useState("couple");
  const [travelerCount, setTravelerCount] = useState(2);
  const [packageType, setPackageType] = useState("essential");
  const [mealOption, setMealOption] = useState("none");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const builderRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    travelDate: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const destinationsQ = useQuery<Destination[]>({
    queryKey: ["public", "destinations"],
    queryFn: () => destinationService.list(),
    staleTime: 1000 * 60 * 10,
  });

  const liveDestinations = useMemo(
    () =>
      (destinationsQ.data ?? [])
        .filter((d) => d.active !== false)
        .map((d) => ({
          id: String(d.id),
          slug: d.slug,
          name: d.name,
          image: d.heroImageUrl || customizeCover,
          minDays: 1,
          suggestedDays: SUGGESTED_DAYS_BY_SLUG[d.slug] ?? 1,
        })),
    [destinationsQ.data]
  );

  const totalDays = selectedDestinations.reduce((acc, d) => acc + d.days, 0);

  const pricing = useMemo(() => {
    return calculatePrice({
      destinations: selectedDestinations.map((d) => ({ id: d.id, days: d.days })),
      travelerType,
      travelerCount,
      packageType,
      mealOption,
      activities: selectedActivities,
    });
  }, [
    selectedDestinations,
    travelerType,
    travelerCount,
    packageType,
    mealOption,
    selectedActivities,
  ]);

  const toggleDestination = (dest: (typeof liveDestinations)[number]) => {
    setSelectedDestinations((prev) => {
      const exists = prev.find((d) => d.id === dest.id);
      if (exists) return prev.filter((d) => d.id !== dest.id);
      return [
        ...prev,
        { id: dest.id, slug: dest.slug, name: dest.name, days: dest.suggestedDays },
      ];
    });
  };

  const updateDays = (destId: string, change: number) => {
    setSelectedDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destId) return d;
        const newDays = Math.max(1, d.days + change);
        return { ...d, days: newDays };
      })
    );
  };

  const toggleActivity = (actId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(actId) ? prev.filter((a) => a !== actId) : [...prev, actId]
    );
  };

  useEffect(() => {
    if (builderRef.current) {
      const headerOffset = 145;
      const elementPosition = builderRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, [step]);

  useEffect(() => {
    if (travelerType === "solo") setTravelerCount(1);
    else if (travelerType === "couple") setTravelerCount(2);
  }, [travelerType]);

  const isFixedCount = travelerType === "solo" || travelerType === "couple";

  const buildQuoteMessage = (): string => {
    const itinerary = selectedDestinations
      .map((d) => `  • ${d.name} — ${d.days} day(s)`)
      .join("\n");
    const acts = selectedActivities
      .map((a) => `  • ${activities.find((x) => x.id === a)?.name ?? a}`)
      .join("\n");

    const lines = [
      "=== Custom Package Builder ===",
      "",
      `Itinerary (${totalDays} days):`,
      itinerary || "  (none)",
      "",
      `Package tier: ${packageType}`,
      `Meals: ${mealOptions.find((m) => m.id === mealOption)?.name ?? mealOption}`,
      "",
      "Activities:",
      acts || "  (none)",
      "",
      `Estimated total (INR): ${pricing.total.toLocaleString("en-IN")}`,
      "",
      contact.notes ? `Notes: ${contact.notes}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleSubmit = async () => {
    if (!contact.name || !contact.email) {
      toast({
        title: "Missing fields",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await quoteService.submit({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        travelerType,
        packageTier: packageType,
        destinations: selectedDestinations.map((d) => d.name),
        travelDates: contact.travelDate || null,
        groupSize: travelerCount,
        requirements: buildQuoteMessage(),
      });
      setIsSuccess(true);
      toast({
        title: "Quote request sent",
        description: "We will reach out within 24 hours.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not submit",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Custom Package Builder"
        description="Design your own Bihar pilgrimage — pick destinations, package tier, meals, and activities. Get a personalised quote within 24 hours."
        keywords="custom bihar tour, bodh gaya custom trip, magadh pilgrimage builder, build your own tour"
      />

      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${customizeCover})` }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Custom Package Builder
            </h1>
            <p className="text-white text-lg">
              Create your perfect Bihar travel experience with our dynamic package builder
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 border-b border-border sticky top-16 bg-background z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: "Destinations" },
              { num: 2, label: "Travelers" },
              { num: 3, label: "Package" },
              { num: 4, label: "Activities" },
              { num: 5, label: "Review" },
            ].map((s) => {
              const isDisabled = s.num > 1 && selectedDestinations.length === 0;
              return (
                <button
                  key={s.num}
                  onClick={() => !isDisabled && setStep(s.num)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                      step >= s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      "hidden md:inline text-sm font-medium",
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div ref={builderRef} className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Select Your Destinations
                </h2>
                <p className="text-muted-foreground mb-6">
                  Choose the places you want to visit and set the number of days for each
                </p>

                {destinationsQ.isLoading && (
                  <p className="text-muted-foreground">Loading destinations…</p>
                )}
                {destinationsQ.isError && (
                  <p className="text-destructive">
                    Could not load destinations. Please refresh.
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {liveDestinations.map((dest) => {
                    const selected = selectedDestinations.find((d) => d.id === dest.id);
                    return (
                      <div
                        key={dest.id}
                        className={cn(
                          "relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                          selected
                            ? "border-primary shadow-medium"
                            : "border-transparent shadow-soft hover:shadow-medium"
                        )}
                        onClick={() => toggleDestination(dest)}
                      >
                        <div className="relative h-32">
                          <img
                            src={dest.image}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <h3 className="font-display font-semibold text-primary-foreground">
                              {dest.name}
                            </h3>
                          </div>
                          {selected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        {selected && (
                          <div
                            className="p-3 bg-card"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Days</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateDays(dest.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">
                                  {selected.days}
                                </span>
                                <button
                                  onClick={() => updateDays(dest.id, 1)}
                                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Who's Traveling?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select your travel group type and the number of travelers
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {travelerTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTravelerType(type.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        travelerType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-3xl mb-2 block">
                        <img
                          src={type.icon}
                          alt={type.name}
                          className="w-10 h-10 object-contain"
                        />
                      </span>
                      <span className="font-semibold text-foreground">{type.name}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-card p-6 rounded-xl">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Number of Travelers
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setTravelerCount((prev) => Math.max(1, prev - 1))
                      }
                      disabled={isFixedCount || travelerCount === 1}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-3xl font-bold text-foreground w-16 text-center">
                      {travelerCount}
                    </span>
                    <button
                      onClick={() =>
                        setTravelerCount((prev) => Math.min(20, prev + 1))
                      }
                      disabled={isFixedCount || travelerCount === 20}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Choose Your Package
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select your preferred package type and meal options
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {packageTypes.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setPackageType(pkg.id)}
                      className={cn(
                        "p-6 rounded-xl border-2 text-left transition-all",
                        packageType === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {pkg.name}
                        </h3>
                        {packageType === pkg.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="bg-card p-6 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Meal Options
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mealOptions.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => setMealOption(meal.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all",
                          mealOption === meal.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="font-medium text-foreground">{meal.name}</span>
                        {meal.multiplier > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            +{meal.multiplier * 100}%
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Add Activities
                </h2>
                <p className="text-muted-foreground mb-6">
                  Enhance your trip with special activities and experiences
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {activities.map((activity) => {
                    const isSelected = selectedActivities.includes(activity.id);
                    return (
                      <button
                        key={activity.id}
                        onClick={() => toggleActivity(activity.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div>
                          <span className="font-medium text-foreground block">
                            {activity.name}
                          </span>
                          <span className="text-sm text-primary font-semibold">
                            {formatPrice(activity.price)} / person
                          </span>
                        </div>
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          )}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Review & Request Quote
                </h2>
                <p className="text-muted-foreground mb-6">
                  Confirm your selections and share contact details — we'll send a
                  tailored quote within 24 hours
                </p>

                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-xl">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Destinations ({totalDays} days total)
                    </h3>
                    <div className="space-y-3">
                      {selectedDestinations.map((d) => (
                        <div key={d.id} className="flex items-center justify-between">
                          <span className="text-foreground">{d.name}</span>
                          <span className="text-muted-foreground">{d.days} day(s)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Travelers
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">
                        {travelerTypes.find((t) => t.id === travelerType)?.name}
                      </span>
                      <span className="text-muted-foreground">
                        {travelerCount} people
                      </span>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-primary" />
                      Package Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Package Type</span>
                        <span className="text-muted-foreground capitalize">
                          {packageType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Meals</span>
                        <span className="text-muted-foreground">
                          {mealOptions.find((m) => m.id === mealOption)?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedActivities.length > 0 && (
                    <div className="bg-card p-6 rounded-xl">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Activities
                      </h3>
                      <div className="space-y-2">
                        {selectedActivities.map((actId) => {
                          const activity = activities.find((a) => a.id === actId);
                          return (
                            <div
                              key={actId}
                              className="flex items-center justify-between"
                            >
                              <span className="text-foreground">{activity?.name}</span>
                              <span className="text-muted-foreground">
                                {formatPrice((activity?.price || 0) * travelerCount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-card p-6 rounded-xl space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Send className="w-5 h-5 text-primary" />
                      Your Contact Details
                    </h3>

                    {isSuccess ? (
                      <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-foreground">
                          Quote request sent!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          We'll email you within 24 hours.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-primary" />
                              Full Name *
                            </label>
                            <Input
                              value={contact.name}
                              onChange={(e) =>
                                setContact({ ...contact, name: e.target.value })
                              }
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Email *
                            </label>
                            <Input
                              type="email"
                              value={contact.email}
                              onChange={(e) =>
                                setContact({ ...contact, email: e.target.value })
                              }
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Phone className="w-4 h-4 text-primary" />
                              Phone
                            </label>
                            <PhoneInput
                              value={contact.phone}
                              onChange={(v) =>
                                setContact({ ...contact, phone: v })
                              }
                              placeholder="00000 00000"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              Preferred Travel Date
                            </label>
                            <Input
                              type="date"
                              value={contact.travelDate}
                              onChange={(e) =>
                                setContact({
                                  ...contact,
                                  travelDate: e.target.value,
                                })
                              }
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>

                        <Textarea
                          placeholder="Special requests, accessibility needs, dietary preferences..."
                          value={contact.notes}
                          onChange={(e) =>
                            setContact({ ...contact, notes: e.target.value })
                          }
                          rows={3}
                        />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < 5 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && selectedDestinations.length === 0}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? "Sending…" : isSuccess ? "Sent" : "Submit Quote Request"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-36 bg-card rounded-2xl p-6 shadow-medium">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Price Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base ({totalDays} days)</span>
                  <span className="text-foreground">
                    {formatPrice(pricing.baseCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Package ({packageType})</span>
                  <span className="text-foreground">
                    {formatPrice(pricing.packageCost - pricing.baseCost)}
                  </span>
                </div>
                {pricing.mealCost > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Meals</span>
                    <span className="text-foreground">
                      {formatPrice(pricing.mealCost)}
                    </span>
                  </div>
                )}
                {pricing.activitiesCost > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Activities</span>
                    <span className="text-foreground">
                      {formatPrice(pricing.activitiesCost)}
                    </span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(pricing.discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For {travelerCount} traveler(s)
                </p>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Prices are indicative. Final pricing will be confirmed after
                    reviewing your requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
