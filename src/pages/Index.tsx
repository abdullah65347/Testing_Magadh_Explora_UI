import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { ExperiencesSection } from "@/components/home/ExperiencesSection";
import { ShareJourneySection } from "@/components/home/ShareJourneySection";
import { TravelConfidenceSection } from "@/components/home/TravelConfidenceSection";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { HomepageDynamicSections } from "@/components/home/HomepageDynamicSections";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Magadh Explora — Bihar's #1 Buddhist & Jain Pilgrimage Tours"
        description="Travel the Legacy, Feel the Culture. Buddhist Circuit tours to Bodh Gaya, Nalanda, Rajgir, Vaishali. Expert multilingual guides for pilgrims from China, Japan, Thailand, Sri Lanka, Vietnam, Bhutan."
        keywords="Bodh Gaya tour, Buddhist pilgrimage India, Nalanda University visit, Rajgir hot springs, Bihar tourism, Jain pilgrimage Pawapuri, Magadh Empire heritage"
      />
      <main>
        <HeroSection />

        <HomepageDynamicSections
          fallback={
            <>
              <PackagesSection />
              <DestinationsSection />
            </>
          }
        />

        <ExperiencesSection />

        <ShareJourneySection />

        <TravelConfidenceSection />

        <NewsletterBand />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
