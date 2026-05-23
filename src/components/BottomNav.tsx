import { Home, ShoppingBag, MessageSquare, ShieldAlert } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
}

export default function BottomNav({ currentScreen, setScreen }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-white/95 border-t border-surface-container-high shadow-lg px-4 py-3 pb-safe">
      <div className="flex justify-around items-center w-full max-w-md mx-auto">
        {/* Home Button */}
        <button
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center justify-center transition-all ${
            currentScreen === "home" 
              ? "text-primary scale-105" 
              : "text-on-surface-variant opacity-70 hover:opacity-100"
          }`}
        >
          <Home className={`w-5.5 h-5.5 ${currentScreen === 'home' ? 'fill-primary/10' : ''}`} />
          <span className="text-[10px] font-semibold font-sans tracking-wide mt-1">Home</span>
        </button>

        {/* Shop Button */}
        <button
          onClick={() => setScreen("shop")}
          className={`flex flex-col items-center justify-center transition-all ${
            currentScreen === "shop" 
              ? "text-primary scale-105" 
              : "text-on-surface-variant opacity-70 hover:opacity-100"
          }`}
        >
          <ShoppingBag className={`w-5.5 h-5.5 ${currentScreen === 'shop' ? 'fill-primary/10' : ''}`} />
          <span className="text-[10px] font-semibold font-sans tracking-wide mt-1">Shop</span>
        </button>

        {/* Contact Button */}
        <button
          onClick={() => setScreen("contact")}
          className={`flex flex-col items-center justify-center transition-all ${
            currentScreen === "contact" 
              ? "text-primary scale-105" 
              : "text-on-surface-variant opacity-70 hover:opacity-100"
          }`}
        >
          <MessageSquare className={`w-5.5 h-5.5 ${currentScreen === 'contact' ? 'fill-primary/10' : ''}`} />
          <span className="text-[10px] font-semibold font-sans tracking-wide mt-1">Contact</span>
        </button>

        {/* Admin/Portal Button */}
        <button
          onClick={() => setScreen(currentScreen === "admin-dashboard" ? "admin-dashboard" : "admin-login")}
          className={`flex flex-col items-center justify-center transition-all ${
            currentScreen === "admin-login" || currentScreen === "admin-dashboard"
              ? "text-primary scale-105" 
              : "text-on-surface-variant opacity-70 hover:opacity-100"
          }`}
        >
          <ShieldAlert className={`w-5.5 h-5.5 ${currentScreen === 'admin-dashboard' ? 'fill-primary/10' : ''}`} />
          <span className="text-[10px] font-semibold font-sans tracking-wide mt-1">Staff</span>
        </button>
      </div>
    </nav>
  );
}
