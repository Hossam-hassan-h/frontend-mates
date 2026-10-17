import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  Trophy,
  MessageCircle,
  MapPin,
  Phone,
  Clock,
  Mail,
} from "lucide-react";
import { ROUTE_PATHS } from "@/app/router/routePaths.js";
import { BrandLogo } from "@/components/common/BrandLogo.jsx";
import { useStoreSettings } from "@/features/settings/useStoreSettings.js";
import { useCategories } from "@/features/customer/categories/hooks/useCategories.js";
import { getText } from "@/utils/getText.js";

export function Footer() {
  const {
    data: storeSettings,
    isLoading: isSettingsLoading,
  } = useStoreSettings();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const whatsapp = storeSettings?.whatsapp || storeSettings?.whatsappNumber;
  const phone = storeSettings?.phone;
  const email = storeSettings?.email;
  const address = storeSettings?.address;
  const workingHours = storeSettings?.workingHours;

  return (
    <footer className="w-full font-sans text-foreground">
      {/* 1. Feature Benefits Section */}
      <section className="bg-card py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-center text-foreground mb-8">
            Why Mates Store?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary text-foreground flex items-center justify-center border border-border">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Fast & Reliable Shipping</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Quick delivery and order tracking directly to your door.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary text-foreground flex items-center justify-center border border-border">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Premium Fabrics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                High-quality cotton fabrics and tailored finishing designed to last.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary text-foreground flex items-center justify-center border border-border">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Matching Outfits</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Complementary sets for couples, friends, and siblings with independent sizing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Loyalty Rewards Banner ("5% Loyalty Points") */}
      <section className="bg-secondary text-secondary-foreground py-12 px-4 border-y border-border">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-start max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-card text-foreground rounded-full text-xs font-bold border border-border">
              <Trophy className="w-3.5 h-3.5" />
              <span>5% Loyalty Program</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-foreground">
              Earn 5% Loyalty Cashback on Every Order
            </h2>

            <div className="text-xs sm:text-sm text-muted-foreground space-y-1 font-medium leading-relaxed">
              <p>Every order at Mates Store earns you 5% back in loyalty points.</p>
              <p>Example: A 1,000 EGP order earns 50 EGP credit to redeem on your next checkout.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-xs w-full max-w-xs space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-secondary text-foreground flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>

            <div className="space-y-1 border-b border-border pb-3">
              <span className="text-muted-foreground text-xs font-medium block">Cashback Rate</span>
              <span className="text-foreground text-lg font-bold block">5% of Subtotal</span>
            </div>

            <div className="space-y-0.5 pt-1">
              <span className="text-foreground text-sm font-semibold block">100 EGP Order</span>
              <span className="text-muted-foreground text-xs font-medium block">= 5 EGP Store Credit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Direct Contact Support Bar */}
      {whatsapp && (
        <section className="bg-background text-foreground py-8 px-4 text-center border-b border-border">
          <div className="container mx-auto max-w-3xl space-y-3">
            <h3 className="font-serif text-lg font-bold">Have Questions? Connect Directly</h3>
            <p className="text-xs text-muted-foreground font-medium">
              For custom styling, matching assistance, or urgent questions, our team is ready to help.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 4. Main Dark/Light Themed Footer Grid */}
      <section className="bg-background text-muted-foreground py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 text-start">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to={ROUTE_PATHS.HOME} aria-label="Mates Store">
              <BrandLogo />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {isSettingsLoading
                ? "Loading store info..."
                : getText(storeSettings?.shortDescription) || "Matching outfits for couples, friends, and siblings."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-foreground border-b border-border pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={ROUTE_PATHS.HOME} className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to={ROUTE_PATHS.SETS} className="hover:text-foreground transition-colors">
                  Couples Sets
                </Link>
              </li>
              {isCategoriesLoading ? (
                <li>Loading categories...</li>
              ) : isCategoriesError ? (
                <li>
                  <button
                    type="button"
                    onClick={() => refetchCategories()}
                    className="hover:text-foreground"
                  >
                    Failed to load categories — Retry
                  </button>
                </li>
              ) : (
                categories.slice(0, 4).map((category) => (
                  <li key={category._id}>
                    <Link
                      to={`${ROUTE_PATHS.PRODUCTS}?category=${category._id}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {getText(category.name)}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-foreground border-b border-border pb-2">
              Contact & Hours
            </h4>
            <ul className="space-y-2.5 text-xs">
              {address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{getText(address)}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {workingHours && (
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{getText(workingHours)}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="container mx-auto max-w-6xl border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>© {new Date().getFullYear()} Mates Store. All rights reserved.</span>
          <span>Matching outfits for couples, friends, and siblings.</span>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
