import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, Scroll, MapPin, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import {
  ashokanPillarVaishaliImg,
  nalandaUniversityImg,
  rajgirMainImg,
  golGharPatnaImg,
  walkingNalandaImg,
} from "@/assets/assets";

const TIMELINE = [
  {
    period: "c. 600 BCE",
    dynasty: "Haryanka Dynasty",
    headline: "The rise of Magadh",
    body: "King Bimbisara establishes Rajgir (Girivraja) as the capital and forges alliances through marriage with the Kosala and Licchavi clans. His son Ajatashatru fortifies Rajgir and later founds Pataligrama (modern Patna).",
    figures: ["Bimbisara", "Ajatashatru"],
  },
  {
    period: "c. 500 BCE",
    dynasty: "Time of the Buddha & Mahavira",
    headline: "Two world religions begin here",
    body: "Lord Buddha attains enlightenment at Bodh Gaya and preaches across Rajgir, Nalanda and Vaishali. Lord Mahavira — born in Vaishali — establishes Jainism's final form, attaining Nirvana at Pawapuri.",
    figures: ["Buddha", "Mahavira"],
  },
  {
    period: "c. 413–345 BCE",
    dynasty: "Shishunaga & Nanda Dynasties",
    headline: "Magadh becomes an empire",
    body: "The Shishunagas annex Avanti and Vatsa. The Nandas (Mahapadma Nanda) amass an army of 200,000 infantry and India's first standing imperial bureaucracy. Their wealth becomes legendary.",
    figures: ["Mahapadma Nanda", "Dhana Nanda"],
  },
  {
    period: "c. 322–185 BCE",
    dynasty: "Mauryan Empire",
    headline: "The first Indian empire",
    body: "Chandragupta Maurya, guided by Chanakya, overthrows the Nandas and unifies most of the subcontinent from Pataliputra. His grandson Ashoka, after the Kalinga war, embraces Buddhism and spreads it across Asia via edicts and missionaries — including his son Mahendra to Sri Lanka.",
    figures: ["Chandragupta Maurya", "Chanakya", "Bindusara", "Ashoka"],
  },
  {
    period: "c. 185 BCE – 320 CE",
    dynasty: "Shunga, Kanva & Mitra rulers",
    headline: "A Brahminical revival",
    body: "Pushyamitra Shunga's coup ends the Mauryans. Sanskrit literature flourishes, Patanjali compiles his Yoga Sutras, and the Bharhut stupa is built. Magadh remains the cultural heart even as political power fragments.",
    figures: ["Pushyamitra Shunga", "Patanjali"],
  },
  {
    period: "c. 320–550 CE",
    dynasty: "Gupta Golden Age",
    headline: "Mathematics, art and a great university",
    body: "Chandragupta I makes Pataliputra his capital. Under Kumaragupta I, Nalanda University is founded — drawing scholars from China, Korea and Tibet for the next 800 years. Aryabhata defines zero and π here; Sanskrit drama peaks with Kalidasa.",
    figures: ["Chandragupta I", "Samudragupta", "Kumaragupta I", "Aryabhata"],
  },
  {
    period: "c. 750–1200 CE",
    dynasty: "Pala Dynasty",
    headline: "Buddhism's last Indian flourish",
    body: "The Palas patronise Mahayana and Vajrayana Buddhism. Vikramshila and Odantapuri universities rise to rival Nalanda. Pala bronze sculpture and palm-leaf manuscripts spread the Dharma to Tibet and Southeast Asia.",
    figures: ["Gopala", "Dharmapala", "Devapala"],
  },
  {
    period: "1193 CE",
    dynasty: "End of an Era",
    headline: "Nalanda burns",
    body: "Bakhtiyar Khilji sacks Nalanda and Vikramshila. The university's libraries are said to have burned for months. With them, India's institutionalised Buddhist scholarship effectively ends — though pilgrimage continues quietly through the centuries.",
    figures: ["Bakhtiyar Khilji"],
  },
];

const KEY_FIGURES = [
  {
    name: "Chandragupta Maurya",
    role: "Founder of the Mauryan Empire (r. 322–298 BCE)",
    bio: "Mentored by Chanakya, he ousted the Nandas and built India's first pan-subcontinental empire from Pataliputra. Late in life he became a Jain ascetic and is believed to have died at Shravanabelagola.",
  },
  {
    name: "Ashoka the Great",
    role: "Mauryan Emperor (r. 268–232 BCE)",
    bio: "After the bloody Kalinga war he renounced violence, embraced Buddhism, and inscribed his Dhamma edicts on pillars and rocks across the empire. His emblem — the Sarnath capital — is independent India's national emblem.",
  },
  {
    name: "Chanakya (Kautilya)",
    role: "Statesman & author of the Arthashastra (c. 350–275 BCE)",
    bio: "The strategist behind Chandragupta's rise. His Arthashastra remains a foundational text on economics, statecraft, and intelligence — predating Machiavelli by 1,800 years.",
  },
  {
    name: "Aryabhata",
    role: "Mathematician-astronomer (476–550 CE)",
    bio: "Worked at Nalanda. Computed π to four decimal places, defined zero as a placeholder, and proposed that Earth rotates on its axis — centuries before Copernicus.",
  },
];

const SITES = [
  { name: "Rajgir", note: "Haryanka & Mauryan capital — cyclopean walls still visible.", image: rajgirMainImg },
  { name: "Pataliputra (Patna)", note: "Mauryan & Gupta capital. Ashoka's pillared hall ruins at Kumhrar.", image: golGharPatnaImg },
  { name: "Nalanda", image: nalandaUniversityImg, note: "World's first residential university (5th–12th c.). UNESCO site." },
  { name: "Vaishali", note: "First republic in history; Ashokan lion pillar still intact.", image: ashokanPillarVaishaliImg },
];

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The History of Magadh — From Bimbisara to the Pala Dynasty",
  description: "A 1,800-year history of Magadh — the heartland of Bihar — covering the Haryanka, Mauryan, Gupta and Pala dynasties.",
  author: { "@type": "Organization", name: "Magadh Explora" },
  publisher: { "@type": "Organization", name: "Magadh Explora" },
};

export default function HistoryOfMagadhPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="The History of Magadh — Bimbisara, Mauryan & Gupta Empires"
        description="A guided history of Magadh — Bihar's ancient heartland. From Bimbisara and Ashoka to Aryabhata and Nalanda University, 1,800 years of empires, religions and ideas."
        keywords="history of Magadh, Mauryan empire, Ashoka, Chandragupta Maurya, Nalanda university, Pataliputra history, Bihar ancient history, Gupta empire"
        type="article"
        jsonLd={articleLd}
      />

      <section className="pt-24 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${walkingNalandaImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center py-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm mb-6">
              <Scroll className="w-4 h-4" />
              1,800 years of history
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              The History of Magadh
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl">
              From Bimbisara's fortress at Rajgir to Ashoka's edicts and the libraries
              of Nalanda — the story of India's most influential ancient kingdom.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Magadh — the ancient name for the central plains of modern Bihar — is not
            just a place. It is the cradle of the Indian state, of two world religions
            (Buddhism and Jainism), of the world's first residential university, and
            of the concept of zero itself.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            For over a millennium, every major idea that shaped India was either born
            here or refined here. The pages below trace that arc.
          </p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12 flex items-center justify-center gap-2">
            <Crown className="w-7 h-7 text-primary" />
            Dynasties & Epochs
          </h2>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

            <div className="space-y-12">
              {TIMELINE.map((era, i) => (
                <motion.div
                  key={era.period}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`relative grid md:grid-cols-2 gap-6 ${
                    i % 2 === 0 ? "" : "md:[&>div]:order-1"
                  }`}
                >
                  <div
                    className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 mt-2`}
                  />
                  <div
                    className={`pl-12 md:pl-0 ${
                      i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:col-start-2"
                    }`}
                  >
                    <p className="text-sm font-semibold text-primary mb-1">
                      {era.period}
                    </p>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
                      {era.dynasty}
                    </h3>
                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                      {era.headline}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{era.body}</p>
                    <div
                      className={`mt-3 flex flex-wrap gap-2 ${
                        i % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      {era.figures.map((f) => (
                        <span
                          key={f}
                          className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12 flex items-center justify-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" />
            Key Figures
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {KEY_FIGURES.map((p) => (
              <div
                key={p.name}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {p.name}
                </h3>
                <p className="text-sm text-primary font-medium mb-3">{p.role}</p>
                <p className="text-muted-foreground leading-relaxed">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12 flex items-center justify-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Walk the Historical Sites
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {SITES.map((s) => (
              <div
                key={s.name}
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {s.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-spiritual rounded-3xl p-10 md:p-14 text-primary-foreground">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              See the history with your own eyes
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Our heritage tours are led by guides trained at the Bihar State Tourism
              and ASI — they bring the ruins to life.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/packages">
                <Button variant="hero" size="lg">
                  Heritage Packages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/customize">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20"
                >
                  Plan Custom Tour
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
