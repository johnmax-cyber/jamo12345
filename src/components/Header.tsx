import { Menu, ShoppingCart, User, Landmark } from 'lucide-react';
import { ScreenType, CartItem } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  cart: CartItem[];
  setCartOpen: (open: boolean) => void;
}

export default function Header({ currentScreen, setScreen, cart, setCartOpen }: HeaderProps) {
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md shadow-sm border-b border-surface-container-high transition-all">
      <div className="flex justify-between items-center px-5 md:px-12 h-20 w-full max-w-7xl mx-auto">
        {/* Left Side: Mobile Menu or Brand Label */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setScreen("home")}
            className="md:hidden text-primary hover:text-secondary transition-colors duration-300 pointer-events-auto"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setScreen("home")}
            className="font-serif text-2xl md:text-3xl font-semibold text-primary tracking-tight text-left cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            Susan's Company
          </button>
        </div>

        {/* Desktop Central Navigation Links */}
        <nav className="hidden md:flex gap-8 items-center">
          <button
            onClick={() => setScreen("home")}
            className={`font-sans font-medium text-sm tracking-wide transition-all duration-300 pb-1 border-b-2 cursor-pointer ${
              currentScreen === "home" 
                ? "text-primary border-secondary" 
                : "text-on-surface-variant hover:text-primary border-transparent"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setScreen("shop")}
            className={`font-sans font-medium text-sm tracking-wide transition-all duration-300 pb-1 border-b-2 cursor-pointer ${
              currentScreen === "shop" 
                ? "text-primary border-secondary" 
                : "text-on-surface-variant hover:text-primary border-transparent"
            }`}
          >
            Shop Curated
          </button>
          <button
            onClick={() => setScreen("contact")}
            className={`font-sans font-medium text-sm tracking-wide transition-all duration-300 pb-1 border-b-2 cursor-pointer ${
              currentScreen === "contact" 
                ? "text-primary border-secondary" 
                : "text-on-surface-variant hover:text-primary border-transparent"
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setScreen(currentScreen === "admin-dashboard" ? "admin-dashboard" : "admin-login")}
            className={`font-sans font-medium text-sm tracking-wide transition-all duration-300 pb-1 border-b-2 cursor-pointer ${
              currentScreen === "admin-login" || currentScreen === "admin-dashboard"
                ? "text-primary border-secondary" 
                : "text-on-surface-variant hover:text-primary border-transparent"
            }`}
          >
            Portal
          </button>
        </nav>

        {/* Right Actions: Shopping Cart Toggle & User Role */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCartOpen(true)}
            className="text-primary hover:text-secondary transition-all p-2 rounded-full hover:bg-surface-container-low relative active:scale-90 cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white font-sans text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-scale">
                {totalItemsCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              if (currentScreen === "admin-dashboard") {
                setScreen("home");
              } else {
                setScreen("admin-login");
              }
            }}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant text-xs font-semibold tracking-wide transition-all duration-300 ${
              currentScreen === "admin-dashboard"
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-primary hover:bg-surface-container-high"
            }`}
            title="Admin Login"
          >
            <User className="w-4 h-4" />
            <span>{currentScreen === "admin-dashboard" ? "Admin Mode" : "Staff Log"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
