import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MapPin, Clock, MessageSquare, CheckCircle, AlertCircle, Send } from "lucide-react";
import { ContactMessage } from "../types";

interface ContactViewProps {
  onAddMessage: (message: Omit<ContactMessage, "id" | "date" | "isRead">) => void;
}

export default function ContactView({ onAddMessage }: ContactViewProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!name.trim()) {
      setErrorText("Please fill out your name so we can address your message.");
      return;
    }
    if (!phone.trim()) {
      setErrorText("We require a phone number to reach you regarding custom tailoring or orders.");
      return;
    }
    if (!interest) {
      setErrorText("Please select a product interest option.");
      return;
    }
    if (!message.trim()) {
      setErrorText("Please write a small inquiry note so our staff can assist you properly.");
      return;
    }

    setIsSubmitting(true);

    // Simulate safe boutique server response delay
    setTimeout(() => {
      onAddMessage({
        name,
        phone,
        interest,
        message
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Clear inputs
      setName("");
      setPhone("");
      setInterest("");
      setMessage("");

      // Auto-dismiss success notification after 5 seconds to let them send another message if desired
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary mb-4 leading-tight">Get in Touch</h2>
        <div className="w-20 col-span-1 border-b-2 border-secondary mx-auto mb-4" />
        <p className="font-sans text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          We'd love to hear from you. Send us a direct message or visit our peaceful Nairobi boutique showroom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-surface-container-high p-6 md:p-10 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-6">Send a Message</h3>
            
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                /* Success notification */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-primary/5 p-6 rounded-xl border border-primary/20 flex flex-col items-center text-center space-y-3 mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-primary" />
                  <h4 className="font-serif text-lg font-bold text-primary">Inquiry Sent Succesfully</h4>
                  <p className="font-sans text-xs text-on-surface-variant max-w-md">
                    Thank you! Susan and our showroom staff have received your message. We will reach you on phone within 2 hours. Your message is also live in our Admin Portal!
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorText && (
                <div className="flex items-center gap-2 bg-error/5 p-3 rounded-lg text-xs font-semibold text-error border border-error/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Name field */}
              <div>
                <label className="block font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2.5 focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-sans text-sm text-on-surface outline-none"
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="block font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000000"
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2.5 focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-sans text-sm text-on-surface outline-none"
                />
              </div>

              {/* Interest dropdown */}
              <div>
                <label className="block font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-2" htmlFor="interest">
                  Product Interest
                </label>
                <select
                  id="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2.5 focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-sans text-sm text-on-surface outline-none cursor-pointer appearance-none"
                >
                  <option value="">Select an option</option>
                  <option value="Clothing Inquiries">Modest Clothes / Abayas Catalog</option>
                  <option value="Accessories & Hijabs">Silk Hijabs & Accessiories</option>
                  <option value="Custom Tailoring Appointment">Showroom Custom Fitting</option>
                  <option value="Book Clubs & Literature">Literature & Philosophy Request</option>
                </select>
              </div>

              {/* Message field */}
              <div>
                <label className="block font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you with our catalog?"
                  rows={4}
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2.5 focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-sans text-sm text-on-surface outline-none resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending message to Susan...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info Column */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-surface-container-high p-6 md:p-8 space-y-8 flex-grow">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-6">Contact Information</h3>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="p-2.5 bg-primary/5 rounded-full text-secondary shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-1">Phone Inquiry</p>
                  <p className="font-sans font-medium text-base text-primary hover:text-secondary cursor-pointer transition-colors">
                    +254 712 345 678
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant/70 mt-0.5">Showroom office mobile line</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <span className="p-2.5 bg-primary/5 rounded-full text-secondary shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-1">Our Location</p>
                  <p className="font-sans font-medium text-base text-primary">
                    The Village Market, Limuru Road
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant/70 mt-0.5">Westlands sub-county, Nairobi, Kenya</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <span className="p-2.5 bg-primary/5 rounded-full text-secondary shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-xs text-on-surface-variant tracking-wider uppercase mb-1">Showroom Hours</p>
                  <p className="font-sans font-medium text-base text-primary">
                    Mon – Sat: 9:00 AM – 7:00 PM
                  </p>
                  <p className="font-sans text-xs text-error mt-0.5 font-semibold">Sunday: Closed</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Chat on WhatsApp CTA widget */}
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-white py-4.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-center font-sans uppercase font-bold text-xs tracking-widest cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
