import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, User, Mail, Phone, Globe, Users, Calendar, Wallet, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { quoteService } from "@/api/services/quoteService";
import { useFormAbandonment } from "@/hooks/useFormAbandonment";
import { track } from "@/lib/analytics";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional prefill — used by the recovery-link flow to restore an abandoned enquiry. */
  prefill?: { name?: string; email?: string; phone?: string };
}
const destinationOptions = [
  "Bodh Gaya", "Rajgir", "Nalanda", "Pawapuri", "Vaishali",
  "Kesariya", "Patna", "Gaya", "Vikramshila", "Rohtasgarh"
];

export function QuoteModal({ isOpen, onClose, prefill }: QuoteModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const datePickerRef = useRef<DatePicker>(null);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    travelerType: "",
    packageTier: "",
    destinations: [] as string[],
    travelDates: null as Date | null,
    groupSize: "",
    budget: "",
    requirements: "",
  });

  useFormAbandonment({
    source: "quote-modal",
    formState: formData,
    submitted: isSuccess,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) void track({ eventType: "form_start", properties: { form: "quote" } });
  }, [isOpen]);

  // Seed from prefill when modal opens with recovery data
  useEffect(() => {
    if (!isOpen || !prefill) return;
    setFormData((prev) => ({
      ...prev,
      name: prefill.name ?? prev.name,
      email: prefill.email ?? prev.email,
      phone: prefill.phone ?? prev.phone,
    }));
  }, [isOpen, prefill?.name, prefill?.email, prefill?.phone]);

  const handleDestinationToggle = (dest: string) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.includes(dest)
        ? prev.destinations.filter((d) => d !== dest)
        : [...prev.destinations, dest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing fields",
        description: "Name and Email are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await quoteService.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        travelerType: formData.travelerType,
        packageTier: formData.packageTier,
        destinations: formData.destinations,
        travelDates: formData.travelDates
          ? formData.travelDates.toLocaleDateString("en-CA")
          : null,
        groupSize: formData.groupSize ? Number(formData.groupSize) : null,
        budget: formData.budget,
        requirements: formData.requirements,
      });

      setIsSuccess(true);
      void track({
        eventType: "form_submit",
        properties: {
          form: "quote",
          email: formData.email,
          country: formData.country || undefined,
          budget: formData.budget || undefined,
        },
      });
      toast({
        title: "Success!",
        description: t.quote.success,
      });

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          country: "",
          travelerType: "",
          packageTier: "",
          destinations: [],
          travelDates: null,
          groupSize: "",
          budget: "",
          requirements: "",
        });
        onClose();
      }, 2000);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: t.common.error,
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          {/* Modal - Centered */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl"
            >


              {/* Success State */}
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
                    {t.quote.success}
                  </h3>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">
                        {t.quote.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.quote.subtitle}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="max-h-[calc(90vh-88px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            {t.quote.name} *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            {t.quote.email} *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            required
                          />
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            By providing your details, you consent to be contacted by Magadh Explora.
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            {t.quote.phone}
                          </label>
                          <PhoneInput
                            value={formData.phone}
                            onChange={(v) => setFormData({ ...formData, phone: v })}
                            placeholder="00000 00000"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            {t.quote.country}
                          </label>
                          <Input
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder="India"
                          />
                        </div>
                      </div>

                      {/* Traveler Type */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          {t.quote.travelerType}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(t.quote.travelerTypes).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormData({ ...formData, travelerType: key })}
                              className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                formData.travelerType === key
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Package Tier */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">{t.quote.packageTier}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {["essential", "deluxe", "premium"].map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setFormData({ ...formData, packageTier: tier })}
                              className={cn(
                                "p-4 rounded-xl text-center transition-all border-2",
                                formData.packageTier === tier
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-lg font-bold capitalize",
                                  tier === "premium" && "text-gold",
                                  tier === "deluxe" && "text-primary"
                                )}
                              >
                                {t.tiers[tier as keyof typeof t.tiers].name}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t.tiers[tier as keyof typeof t.tiers].tagline}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Destinations */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">{t.quote.destinations}</label>
                        <div className="flex flex-wrap gap-2">
                          {destinationOptions.map((dest) => (
                            <button
                              key={dest}
                              type="button"
                              onClick={() => handleDestinationToggle(dest)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm transition-all",
                                formData.destinations.includes(dest)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Travel Details */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {t.quote.travelDates}
                          </label>
                          <div className="relative">
                            <DatePicker
                              ref={datePickerRef}
                              selected={formData.travelDates}
                              onChange={(date: Date | null) =>
                                setFormData({ ...formData, travelDates: date })
                              }
                              dateFormat="dd MMMM yyyy"
                              minDate={new Date()}
                              maxDate={
                                new Date(
                                  new Date().setMonth(new Date().getMonth() + 12)
                                )
                              }
                              placeholderText="Select travel date"
                              calendarClassName="quote-datepicker"
                              popperClassName="quote-datepicker-popper"
                              wrapperClassName="w-full"
                              className="w-full h-10 pl-3 pr-10  rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            {/* Calendar Icon */}
                            <Calendar
                              onClick={() => datePickerRef.current?.setOpen(true)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            {t.quote.groupSize}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={formData.groupSize}
                            onChange={(e) =>
                              setFormData({ ...formData, groupSize: e.target.value })
                            }
                            placeholder="2"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-primary" />
                            {t.quote.budget}
                          </label>
                          <select
                            value={formData.budget}
                            onChange={(e) =>
                              setFormData({ ...formData, budget: e.target.value })
                            }
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="">Select...</option>
                            {Object.entries(t.quote.budgetRanges).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Special Requirements */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          {t.quote.requirements}
                        </label>
                        <Textarea
                          value={formData.requirements}
                          onChange={(e) =>
                            setFormData({ ...formData, requirements: e.target.value })
                          }
                          placeholder="Any dietary restrictions, accessibility needs, specific interests..."
                          rows={3}
                          maxLength={1000}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pb-8">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                              {t.quote.submitting}
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              {t.quote.submit}
                            </>
                          )}
                        </Button>
                      </div>
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
