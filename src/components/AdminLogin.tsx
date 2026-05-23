import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { ScreenType } from "../types";
import { signInWithEmail } from "../auth";

interface AdminLoginProps {
  setScreen: (screen: ScreenType) => void;
}

export default function AdminLogin({ setScreen }: AdminLoginProps) {
  const [email, setEmail] = useState("johnmax4354@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsVerifying(true);
    try {
      const session = await signInWithEmail(email, password);
      if (session && session.user) {
        setScreen("admin-dashboard");
      }
    } catch (err: any) {
      console.error("Admin Sign In Error:", err);
      setErrorMessage(err.message || "Access denied. Only the store admin can log in.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto my-12"
    >
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 md:p-10 relative overflow-hidden border border-surface-container-high">
        {/* Decorative Golden Accent Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c9a84c]" />

        <header className="text-center mb-6 flex flex-col items-center gap-1">
          <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
            <ShieldAlert className="w-7 h-7" style={{ color: "#1a4a2e" }} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: "#1a4a2e" }}>
            Susan's Company
          </h1>
          <p className="font-sans text-xs uppercase tracking-widest font-semibold text-on-surface-variant font-mono">
            Admin Portal — Credentials Authentication
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2" htmlFor="email">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
              placeholder="e.g. admin@susans.company"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2" htmlFor="password">
              Secure Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-gray-700 text-gray-400 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            style={{ backgroundColor: "#1a4a2e" }}
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>{isVerifying ? "Verifying Session..." : "Sign In"}</span>
          </button>
        </form>

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 p-4 rounded-xl text-xs font-semibold text-red-600 border border-red-200 mt-6 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-8 text-center pt-4 border-t border-surface-container-high">
          <p className="font-sans text-[11px] text-gray-500 leading-relaxed font-light">
            Authorized admin access only. Sessions &amp; data are monitored and encrypted in compliance with Supabase RLS security rules.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
