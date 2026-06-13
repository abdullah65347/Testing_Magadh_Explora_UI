import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react";
import { MagadhExploraLogo } from "@/assets/assets";

const footerLinks = {
  explore: [
    { name: "All Packages", path: "/packages" },
    { name: "Custom Tours", path: "/customize" },
    { name: "Jain Pilgrimage", path: "/jain-tours" },
    { name: "Buddhist Circuit", path: "/buddhist-tours" },
    { name: "History of Magadh", path: "/history-of-magadh" },
    { name: "Destinations", path: "/destinations" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Our Team", path: "/team" },
    { name: "Blog", path: "/blog" },
    { name: "Manage Booking", path: "/manage-booking" },
    { name: "Contact Us", path: "/contact" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-gold flex items-center justify-center">
                <img
                  src={MagadhExploraLogo}
                  alt="Magadh Explora Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Magadh Explora</h2>
                <p className="text-xs text-primary-foreground/70 tracking-wider">
                  Discover Ancient Bihar
                </p>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Experience the spiritual and historical wonders of Bihar with our premium
              travel packages. From ancient Buddhist sites to Jain pilgrimage destinations,
              we craft unforgettable journeys.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Religious Tours */}
          {/* <div>
            <h3 className="font-display font-semibold text-lg mb-4">Religious Tours</h3>
            <ul className="space-y-3">
              {footerLinks.religious.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@magadhexplora.com"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  info@magadhexplora.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    123 Heritage Road,<br />
                    Rajgir, Bihar 803116<br />
                    India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Magadh Explora. All rights reserved.
            </p>
            <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
              Crafted with <Heart className="w-4 h-4 text-primary fill-primary" /> for Bihar Tourism
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
