import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Shield } from "lucide-react";
import { ScreenType } from "../types";

interface PrivacyPolicyProps {
  setScreen: (screen: ScreenType) => void;
}

export default function PrivacyPolicy({ setScreen }: PrivacyPolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Back to Home Button */}
      <button
        onClick={() => setScreen("home")}
        className="flex items-center gap-2 text-primary/70 hover:text-primary transition-colors cursor-pointer mb-8 font-sans font-semibold text-xs uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-surface-container-high p-6 md:p-10">
        <header className="border-b border-gray-100 pb-8 mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2" style={{ color: "#1a4a2e" }}>
                Privacy Policy
              </h1>
              <p className="font-sans text-xs text-[#c9a84c] tracking-widest uppercase font-semibold">
                Susan's Company
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-primary/5 px-4 py-2 rounded-full self-center sm:self-auto text-[11px] font-sans font-bold text-primary uppercase tracking-wider">
              <Shield className="w-4 h-4 text-primary" style={{ color: "#1a4a2e" }} />
              <span>Last Updated: June 2025</span>
            </div>
          </div>
        </header>

        <div className="space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
          {/* Who We Are */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              1. Who We Are
            </h2>
            <p>
              Susan's Company is a family-owned modest fashion and books store based in Nairobi, Kenya. We sell clothing and books online via{" "}
              <a href="https://susan-s-company.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#c9a84c] font-medium">
                susan-s-company.vercel.app
              </a>{" "}
              and take orders via WhatsApp (+254 700 000 000).
            </p>
          </section>

          {/* What Information We Collect */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              2. What Information We Collect
            </h2>
            <p>
              When you place an order or send us a message, we collect: your name, phone number, delivery location, and payment method (M-Pesa or Cash on Delivery). We do not collect payment card details. We do not collect your email address unless you provide it voluntarily.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              3. How We Use Your Information
            </h2>
            <p>
              We use your information solely to: process and fulfill your order, contact you about your order status via WhatsApp, and respond to your inquiries. We do not use your information for marketing without your consent.
            </p>
          </section>

          {/* Data Storage & Security */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              4. Data Storage & Security
            </h2>
            <p>
              Your data is stored securely using Supabase (supabase.com), a trusted cloud database provider. All data is encrypted in transit and at rest. We apply Row Level Security policies to ensure only authorized staff can access customer data.
            </p>
          </section>

          {/* Third Parties */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              5. Third Parties
            </h2>
            <p>
              We do not sell, rent, or share your personal data with any third parties. M-Pesa payments are processed directly through Safaricom's platform and are not stored by Susan's Company.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              6. Your Rights
            </h2>
            <p>
              You have the right to request that we delete your personal data at any time. To do so, contact us via WhatsApp at +254 700 000 000 or send a message through our Contact page. We will process your request within 7 business days.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              7. Cookies
            </h2>
            <p>
              This website does not use advertising cookies or tracking cookies. We only use essential session cookies required for the site to function.
            </p>
          </section>

          {/* Children */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              8. Children
            </h2>
            <p>
              Our services are not directed at children under the age of 13. We do not knowingly collect data from minors.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              9. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. The latest version will always be available on this page.
            </p>
          </section>

          {/* Contact Us */}
          <section className="pt-6 border-t border-gray-100 space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              10. Contact Us
            </h2>
            <p className="font-medium text-primary">
              Susan's Company
            </p>
            <p className="text-xs text-gray-500">
              Nairobi, Kenya<br />
              WhatsApp: +254 700 000 000<br />
              Website: susan-s-company.vercel.app
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
