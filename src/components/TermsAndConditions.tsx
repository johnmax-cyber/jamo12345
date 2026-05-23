import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, FileText } from "lucide-react";
import { ScreenType } from "../types";

interface TermsAndConditionsProps {
  setScreen: (screen: ScreenType) => void;
}

export default function TermsAndConditions({ setScreen }: TermsAndConditionsProps) {
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
                Terms &amp; Conditions
              </h1>
              <p className="font-sans text-xs text-[#c9a84c] tracking-widest uppercase font-semibold">
                Susan's Company
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-primary/5 px-4 py-2 rounded-full self-center sm:self-auto text-[11px] font-sans font-bold text-primary uppercase tracking-wider">
              <FileText className="w-4 h-4 text-primary" style={{ color: "#1a4a2e" }} />
              <span>Last Updated: June 2025</span>
            </div>
          </div>
        </header>

        <div className="space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
          {/* Acceptance of Terms */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By using this website or placing an order with Susan's Company, you agree to these terms. If you do not agree, please do not use our services.
            </p>
          </section>

          {/* Products & Pricing */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              2. Products &amp; Pricing
            </h2>
            <p>
              All prices are listed in Kenyan Shillings (KSh) and are inclusive of applicable costs. Prices may change without prior notice. Product images are for illustration purposes and actual items may vary slightly.
            </p>
          </section>

          {/* Ordering */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              3. Ordering
            </h2>
            <p>
              Orders are placed by clicking "Order Now" or via WhatsApp. An order is confirmed only after Susan's Company staff contacts you to verify details. We reserve the right to cancel any order due to stock unavailability or pricing errors.
            </p>
          </section>

          {/* Payment */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              4. Payment
            </h2>
            <p>
              We accept M-Pesa and Cash on Delivery. M-Pesa payment instructions will be sent via WhatsApp after order confirmation. Payment must be completed before delivery for M-Pesa orders.
            </p>
          </section>

          {/* Delivery */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              5. Delivery
            </h2>
            <p>
              We deliver within Nairobi. Delivery timelines will be communicated via WhatsApp at time of order confirmation. Delivery fees (if any) will be stated before order confirmation. Susan's Company is not responsible for delays caused by factors outside our control.
            </p>
          </section>

          {/* Returns & Exchanges */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              6. Returns &amp; Exchanges
            </h2>
            <p>
              We accept returns or exchanges within 7 days of delivery, provided the item is unworn, unwashed, and in its original condition. Books are non-returnable unless they arrive damaged. To initiate a return, contact us via WhatsApp.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              7. Intellectual Property
            </h2>
            <p>
              All content on this website including text, images, and brand elements belong to Susan's Company and may not be reproduced without written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              8. Limitation of Liability
            </h2>
            <p>
              Susan's Company shall not be liable for any indirect or consequential losses arising from use of our website or products beyond the value of the original purchase.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-bold" style={{ color: "#1a4a2e" }}>
              9. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the Republic of Kenya.
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
