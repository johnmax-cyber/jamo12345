import { motion } from "motion/react";
import { ArrowRight, MapPin, Phone, Clock, ShoppingCart, MessageSquare } from "lucide-react";
import { Product, ScreenType } from "../types";

interface HomeViewProps {
  setScreen: (screen: ScreenType) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function HomeView({ setScreen, products, onAddToCart }: HomeViewProps) {
  // Get sample featured products based on the home mockup
  const featuredProducts = products.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col"
    >
      {/* 1. Hero Section */}
      <section className="relative w-full bg-primary-container text-white py-24 md:py-36 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Semi-transparent pattern overlay for texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542042161784-26ab9e041e89?q=80&w=2000&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-black/45 pointer-events-none" />
        
        <div className="max-w-4xl relative z-10 space-y-8 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-surface-bright tracking-tight leading-tight max-w-3xl"
          >
            Modest Fashion &amp; Books from the Heart of Nairobi
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-base sm:text-lg md:text-xl text-surface-container-high/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Discover and buy elegance that respects tradition. Curated clothing, abayas, and intellectual literature for the discerning individual.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-4"
          >
            <button 
              onClick={() => setScreen("shop")}
              className="bg-secondary text-white hover:bg-secondary-container hover:text-on-secondary-container font-sans font-semibold tracking-wide text-sm md:text-base px-10 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Shop Curated Collection
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Story / Brand Narrative Section (Bento Grid Style) */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Narrative description */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight">Our Story</h2>
            <div className="w-16 h-1 bg-secondary rounded-full" />
            <p className="font-sans text-base text-on-surface-variant leading-relaxed">
              Founded in Nairobi, Susan's Company began as a family endeavor to bring together two profound passions: the quiet elegance of modest fashion and the expansive worlds found within literature.
            </p>
            <p className="font-sans text-base text-on-surface-variant leading-relaxed">
              We believe in providing premium quality garments, custom abayas, high-end tunics, and expertly curated books that speak to both heritage and modern African sensibilities. Experience modesty and literacy under one name.
            </p>
            <button 
              onClick={() => setScreen("contact")}
              className="inline-flex items-center text-primary font-sans font-semibold text-sm hover:text-secondary group transition-colors cursor-pointer text-left self-start"
            >
              <span>Learn more or book fitting appointments</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Boutique Gallery Picture */}
          <div className="md:col-span-7 h-96 sm:h-[420px] rounded-lg overflow-hidden shadow-md relative group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-all duration-300 z-10 pointer-events-none" />
            <img 
              alt="Inside Susan's Boutique Nairobi" 
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA_3keD_TkcygdmHVw59vQ9YzG4z3uGKs2DEwhPHwIDNF-2TWQCpDYvkl8S_VpGEo3h5MDzyQRsYOq0Q_5GknuwhzGcJIjf13743RZ-HoaQAEPlSZFevvbOYHKBbBJsTZTJ1GX4b4ofhYxZ-3eNvs1mYLsWI8ovlVSXmEzdXmOpCm9RbaDFyVMJdchwMcODZCSGIGXH8nz9CqeWckc2sFOrx6aOeBL_z8Hopo5bJ-7cm7RUV6OBeCN7cPPgCW4pB0dcKrV-uIv-SA-"
            />
          </div>
        </div>
      </section>

      {/* 3. Featured Showcase Section */}
      <section className="py-20 bg-surface-container-low px-6 md:px-12 w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">Featured Collections</h2>
            <div className="w-24 h-1 bg-secondary rounded-full mx-auto" />
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Handpicked customer-favorites to elevate both your wardrobe and your intellect.
            </p>
          </div>

          {/* Featured Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <article 
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.03)] lift-hover flex flex-col group"
              >
                {/* Image Frame */}
                <div className="aspect-[4/5] relative overflow-hidden bg-surface-container flex items-center justify-center">
                  {product.image ? (
                    <img 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={product.image}
                    />
                  ) : (
                    <div className="w-full flex items-center justify-center text-white p-6 text-center select-none font-serif font-bold text-base md:text-lg tracking-wide" style={{ backgroundColor: "#1a4a2e", height: "200px", borderRadius: "12px" }}>
                      <span>{product.name}</span>
                    </div>
                  )}
                  {product.isNew && (
                    <span className="absolute top-4 right-4 bg-white/95 text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm tracking-wide">
                      New
                    </span>
                  )}
                </div>

                {/* Info and Price Row */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-primary font-semibold tracking-tight">{product.name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase mt-1">{product.category}</p>
                    <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-2 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-sans font-bold text-base md:text-lg text-primary">KSh {product.price.toLocaleString()}</span>
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 pointer-events-auto active:scale-90 cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center pt-8">
            <button 
              onClick={() => setScreen("shop")}
              className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-sans font-semibold tracking-wide text-sm px-10 py-3.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95"
            >
              View Curated Shop Catalog
            </button>
          </div>
        </div>
      </section>

      {/* 4. Contact Location Preview section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="bg-surface-container rounded-2xl p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 shadow-sm border border-surface-container-high">
          <div className="space-y-4 text-center lg:text-left flex-1">
            <h2 className="font-serif text-3xl font-semibold text-primary">Visit Our Boutique</h2>
            <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-md mx-auto lg:mx-0 leading-relaxed">
              Experience our exquisite clothing drape textures and leaf through literature in person at our peaceful Nairobi showroom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full justify-end">
            <div className="flex items-center gap-4 bg-white/65 p-4 rounded-xl shadow-sm border border-surface-container-high translate-y-0 hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-inner">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-sans font-semibold text-sm text-primary">Nairobi, Kenya</p>
                <p className="font-sans text-xs text-on-surface-variant">The Village Market, Westlands</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/65 p-4 rounded-xl shadow-sm border border-surface-container-high translate-y-0 hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-inner">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-sans font-semibold text-sm text-primary">+254 700 000 000</p>
                <p className="font-sans text-xs text-on-surface-variant">Mon – Sat, 9am – 6pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full bg-primary text-white py-16 px-6 md:px-12 flex flex-col items-center justify-center text-center gap-8 mt-auto border-t border-primary-container">
        <h2 className="font-serif text-3xl text-surface">Susan's Company</h2>
        <div className="flex flex-wrap justify-center gap-8 text-sm text-surface-container-high font-medium">
          <button onClick={() => setScreen("home")} className="hover:text-secondary-fixed transition-colors pointer-events-auto cursor-pointer">Home</button>
          <button onClick={() => setScreen("shop")} className="hover:text-secondary-fixed transition-colors pointer-events-auto cursor-pointer">Shop</button>
          <button onClick={() => setScreen("contact")} className="hover:text-secondary-fixed transition-colors pointer-events-auto cursor-pointer">Contact</button>
          <button onClick={() => setScreen("privacy")} className="hover:text-secondary-fixed transition-colors pointer-events-auto cursor-pointer">Privacy Policy</button>
          <button onClick={() => setScreen("terms")} className="hover:text-secondary-fixed transition-colors pointer-events-auto cursor-pointer font-serif">Terms &amp; Conditions</button>
        </div>
        <div className="border-t border-white/10 w-full max-w-md pt-8">
          <p className="font-sans text-xs text-surface-container-high/70">
            &copy; {new Date().getFullYear()} Susan's Company. Curators of modesty and intellect in Nairobi. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
