import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Compass, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { MagadhExploraLogo } from "@/assets/assets";
import { ProfileMenu } from "../ProfileMenu";
import { ModeToggle, DharmaWheelIcon } from "./ModeToggle";

interface HeaderProps {
  onGetQuote?: () => void;
  onAuthOpen?: (mode: "login" | "register") => void;
}

export function Header({ onGetQuote, onAuthOpen }: HeaderProps) {
  const { t } = useLanguage();
  // Header is always solid white (no transparent state)
  const isScrolled = true;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.packages, path: "/packages" },
    { name: t.nav.customize, path: "/customize" },
    { name: t.nav.destinations, path: "/destinations" },
    { name: t.nav.blog, path: "/blog" },
    { name: t.nav.contact, path: "/contact" },
  ];

  // Pilgrimage "mode" switches — state derived from the current route.
  const activeMode =
    location.pathname === "/jain-tours" ? "jain"
    : location.pathname === "/buddhist-tours" ? "buddhist"
    : null;

  // Clicking an ON switch goes Home (turns it off); an OFF switch goes to its page.
  const toggleJain = () => navigate(activeMode === "jain" ? "/" : "/jain-tours");
  const toggleBuddhist = () => navigate(activeMode === "buddhist" ? "/" : "/buddhist-tours");

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-medium py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white shadow-medium overflow-hidden flex items-center justify-center">
                <img
                  src={MagadhExploraLogo}
                  alt="Magadh Explora Logo"
                  className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
                />
              </div>
              {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background" /> */}
            </div>
            <div className="hidden sm:block">
              <h1
                className={cn(
                  "font-display font-bold text-xl whitespace-nowrap transition-colors duration-300",
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                )}
              >
                Magadh Explora
              </h1>
              <p
                className={cn(
                  "text-xs tracking-wider transition-colors duration-300",
                  isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
                )}
              >
                {t.hero.badge}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl2:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  location.pathname === item.path
                    ? isScrolled
                      ? "text-primary bg-primary/10"
                      : "text-primary-foreground bg-primary-foreground/20"
                    : isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Pilgrimage mode switches */}
            <span className="w-px h-6 bg-border mx-1" />
            <ModeToggle
              label={t.nav.jainTours}
              icon={<Flower2 className="w-4 h-4" />}
              active={activeMode === "jain"}
              trackOnClass="bg-amber-500"
              accentClass="text-amber-600"
              onToggle={toggleJain}
            />
            <ModeToggle
              label={t.nav.buddhistTours}
              icon={<DharmaWheelIcon className="w-4 h-4" />}
              active={activeMode === "buddhist"}
              trackOnClass="bg-primary"
              accentClass="text-primary"
              onToggle={toggleBuddhist}
            />
          </nav>

          {/* CTA Buttons */}
          <div className="hidden xl2:flex items-center gap-3">
            <CurrencySwitcher variant={isScrolled ? 'default' : 'transparent'} />
            <LanguageSelector variant={isScrolled ? 'default' : 'transparent'} />

            {/* Plan Your Journey */}
            <Button variant="hero" size="sm" onClick={onGetQuote}>
              <Compass className="w-4 h-4 mr-1" />
              Plan Your Journey
            </Button>

            <ProfileMenu
              isScrolled={isScrolled}
              onAuthOpen={onAuthOpen}
            />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl2:hidden flex items-center gap-2">
            <CurrencySwitcher variant={isScrolled ? 'default' : 'transparent'} />
            <LanguageSelector variant={isScrolled ? 'default' : 'transparent'} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isScrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="xl2:hidden mt-2 bg-background border-t border-border max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      location.pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Pilgrimage mode switches */}
                <div className="mt-2 pt-2 border-t border-border space-y-1">
                  <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.nav.specialTours}
                  </p>
                  <ModeToggle
                    label={t.nav.jainTours}
                    icon={<Flower2 className="w-4 h-4" />}
                    active={activeMode === "jain"}
                    trackOnClass="bg-amber-500"
                    accentClass="text-amber-600"
                    onToggle={toggleJain}
                    fullWidth
                  />
                  <ModeToggle
                    label={t.nav.buddhistTours}
                    icon={<DharmaWheelIcon className="w-4 h-4" />}
                    active={activeMode === "buddhist"}
                    trackOnClass="bg-primary"
                    accentClass="text-primary"
                    onToggle={toggleBuddhist}
                    fullWidth
                  />
                </div>
              </nav>
              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
                <Button
                  variant="outline"
                  onClick={() => { onAuthOpen?.("login") }}
                >
                  Login / Register
                </Button>
                <Button variant="hero" className="w-full" onClick={onGetQuote}>
                  <Compass className="w-4 h-4 mr-1" />
                  Plan Your Journey
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
