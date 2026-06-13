import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

interface CTASectionProps {
  onGetQuote?: () => void;
}

export function CTASection({ onGetQuote }: CTASectionProps) {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-premium" />
      <div className="absolute inset-0 pattern-heritage opacity-20" />
      
      {/* Decorative Circles */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
              🎯 {t.cta.title}
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              {t.cta.title}
            </h2>
            
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {t.cta.subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button variant="hero" size="xl" onClick={onGetQuote}>
                <MessageCircle className="w-5 h-5 mr-2" />
                {t.nav.getQuote}
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/contact">
                  {t.cta.talkToExpert}
                </Link>
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </a>
              <a 
                href="mailto:info@magadhexplora.com" 
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>info@magadhexplora.com</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
