import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, ShieldAlert, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { ScreenType } from "../types";

interface AdminLoginProps {
  setScreen: (screen: ScreenType) => void;
}

export default function AdminLogin({ setScreen }: AdminLoginProps) {
  const [email, setEmail] = useState("staff@susanscompany.com");
  const [password, setPassword] = useState("staff123");
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your registered staff email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your credentials password.");
      return;
    }

    setIsVerifying(true);

    // Simulate authenticating against local staff database
    setTimeout(() => {
      if (email.trim() === "staff@susanscompany.com" && password === "staff123") {
        setScreen("admin-dashboard");
      } else {
        setErrorMessage("Invalid credentials. Please use the default staff pre-fill: staff@susanscompany.com / staff123");
      }
      setIsVerifying(false);
    }, 900);
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
        <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary-container" />

        {/* Header containing Brand details and Roles */}
        <header className="text-center mb-8 flex flex-col items-center gap-1">
          <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-bold">Susan's Company</h1>
          <p className="font-sans text-xs uppercase tracking-widest font-semibold text-on-surface-variant font-mono">
            Admin Panel — Staff Only
          </p>
        </header>

        {/* Quick Help box providing credentials for testing */}
        <div className="bg-secondary-container/10 border border-secondary/20 p-4 rounded-xl mb-6 space-y-1 text-left">
          <span className="flex items-center gap-1.5 text-[10px] font-sans uppercase font-extrabold text-secondary tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Test Credentials</span>
          </span>
          <p className="text-[11px] font-sans text-on-surface-variant leading-relaxed font-light">
            We have preloaded the demo credentials. Clicking <b>Secure Login</b> below will authenticate you instantly!
          </p>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6 text-left">
          {errorMessage && (
            <div className="flex items-center gap-2 bg-error/5 p-3 rounded-lg text-xs font-semibold text-error border border-error/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Address Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-outline-variant pointer-events-none transition-colors" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@susanscompany.com"
                className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pl-7 pr-4 font-sans text-sm text-on-surface placeholder:text-outline-variant/50 focus:ring-0 focus:border-b-2 focus:border-primary transition-colors outline-none pb-1.5"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <div className="relative group p-0">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-outline-variant pointer-events-none transition-colors" />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pl-7 pr-4 font-sans text-sm text-on-surface placeholder:text-outline-variant/50 focus:ring-0 focus:border-b-2 focus:border-primary transition-colors outline-none pb-1.5"
              />
            </div>
          </div>

          {/* Remember & Forgot Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 transition-colors cursor-pointer"
              />
              <label htmlFor="remember" className="font-sans text-xs font-semibold text-on-surface-variant select-none cursor-pointer">
                Remember me
              </label>
            </div>
            
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset guidelines sent to Nairobi IT admin. For testing, please use password: staff123");
              }}
              className="font-sans text-xs font-semibold text-primary hover:text-secondary transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="mt-4 w-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Authenticating Creds...</span>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info note */}
        <div className="mt-8 text-center pt-4 border-t border-surface-container-high">
          <p className="font-sans text-[11px] text-on-surface-variant/60 leading-relaxed font-light">
            Authorized access only. All sessions &amp; operations are encrypted, monitored and logged.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
