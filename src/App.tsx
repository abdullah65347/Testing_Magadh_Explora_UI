import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/LanguageContext";

import { Header } from "@/components/layout/Header";
import { QuoteModal } from "@/components/QuoteModal";
import ScrollToTop from "@/components/ScrollToTop";
import { LanguageSuggestionBanner } from "@/components/LanguageSuggestionBanner";
import { ThemeApplier } from "@/components/ThemeApplier";
import { RecoveryHandler } from "@/components/RecoveryHandler";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { CookieConsent } from "@/components/CookieConsent";
import TrackingProvider from "@/components/TrackingProvider";

import Index from "./pages/Index";
import Packages from "./pages/Packages";
import Customize from "./pages/Customize";
import Contact from "./pages/Contact";
import Destinations from "./pages/Destinations";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BuddhistTours from "./pages/BuddhistTours";
import JainTours from "./pages/JainTours";
import HistoryOfMagadh from "./pages/HistoryOfMagadh";
import PackageDetail from "./pages/PackageDetail";
import DestinationDetail from "./pages/DestinationDetail";
import BookingView from "./pages/BookingView";
import ManageBooking from "./pages/ManageBooking";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";

import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";
import PackageList from "./pages/Admin/packages/PackageList";
import PackageForm from "./pages/Admin/packages/PackageForm";
import AdminSettings from "./pages/Admin/Settings";
import QueriesIndex from "./pages/Admin/Queries/QueriesIndex";
import ContactList from "./pages/Admin/Queries/ContactList";
import QuoteList from "./pages/Admin/Queries/QuoteList";
import BookingList from "./pages/Admin/Queries/BookingList";
import BookingDetail from "./pages/Admin/Queries/BookingDetail";
import AbandonedList from "./pages/Admin/Queries/AbandonedList";
import AdminTranslations from "./pages/Admin/Translations";
import AdminReviews from "./pages/Admin/Reviews";
import JourneyModeration from "./pages/Admin/JourneyModeration";
import AdminCategories from "./pages/Admin/Categories";
import DestinationList from "./pages/Admin/Destinations/DestinationList";
import DestinationForm from "./pages/Admin/Destinations/DestinationForm";
import BlogList from "./pages/Admin/Blog/BlogList";
import BlogForm from "./pages/Admin/Blog/BlogForm";
import AdminHomepage from "./pages/Admin/Homepage";

const App = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [quotePrefill, setQuotePrefill] = useState<
    { name?: string; email?: string; phone?: string } | undefined
  >(undefined);

  const openQuoteWithPrefill = (prefill: { name?: string; email?: string; phone?: string }) => {
    setQuotePrefill(prefill);
    setIsQuoteOpen(true);
  };

  return (
      <HelmetProvider>
      <LanguageProvider>
        <ConfirmProvider>
        <TooltipProvider>
          <ThemeApplier />
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <ScrollToTop />
            <TrackingProvider />
            <RecoveryHandler onOpenQuote={openQuoteWithPrefill} />
            <WhatsAppFloat />

            <Routes>
              {/* Admin (own layout, no public Header) */}
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="packages" element={<PackageList />} />
                <Route path="packages/new" element={<PackageForm />} />
                <Route path="packages/:id/edit" element={<PackageForm />} />
                <Route path="queries" element={<QueriesIndex />}>
                  <Route path="contacts" element={<ContactList />} />
                  <Route path="quotes" element={<QuoteList />} />
                  <Route path="bookings" element={<BookingList />} />
                  <Route path="abandoned" element={<AbandonedList />} />
                </Route>
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="destinations" element={<DestinationList />} />
                <Route path="destinations/new" element={<DestinationForm />} />
                <Route path="destinations/:id/edit" element={<DestinationForm />} />
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/new" element={<BlogForm />} />
                <Route path="blog/:id/edit" element={<BlogForm />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="journey" element={<JourneyModeration />} />
                <Route path="translations" element={<AdminTranslations />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Public (uses global Header + modals via wrapper) */}
              <Route
                path="/*"
                element={
                  <>
                    <LanguageSuggestionBanner />
                    <Header
                      onGetQuote={() => setIsQuoteOpen(true)}
                      onAuthOpen={(mode) => {
                        setAuthMode(mode);
                        setIsAuthOpen(true);
                      }}
                    />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/packages" element={<Packages />} />
                      <Route path="/packages/:slug" element={<PackageDetail />} />
                      <Route path="/customize" element={<Customize />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/destinations" element={<Destinations />} />
                      <Route path="/destinations/:slug" element={<DestinationDetail />} />
                      <Route path="/jain-tours" element={<JainTours />} />
                      <Route path="/buddhist-tours" element={<BuddhistTours />} />
                      <Route path="/history-of-magadh" element={<HistoryOfMagadh />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/booking/:token" element={<BookingView />} />
                      <Route path="/manage-booking" element={<ManageBooking />} />
                      <Route path="/my-bookings" element={<MyBookings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </>
                }
              />
            </Routes>

            {/* Global Quote Modal */}
            <QuoteModal
              isOpen={isQuoteOpen}
              onClose={() => {
                setIsQuoteOpen(false);
                setQuotePrefill(undefined);
              }}
              prefill={quotePrefill}
            />
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              mode={authMode}
              onSwitchMode={setAuthMode}
            />
            <CookieConsent />
          </BrowserRouter>

        </TooltipProvider>
        </ConfirmProvider>
      </LanguageProvider>
      </HelmetProvider>
  );
};

export default App;
