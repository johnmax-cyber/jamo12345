import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Tag, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface ShopViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ShopView({ products, onAddToCart }: ShopViewProps) {
  const [selectedTab, setSelectedTab] = useState<"all" | "clothes" | "books" | "sale">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Re-run loading animation when filter is modified to recreate the mock's skeleton loading experience
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Filter products based on active tab and search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (selectedTab === "all") return true;
    if (selectedTab === "clothes") return product.category === "clothes";
    if (selectedTab === "books") return product.category === "books";
    if (selectedTab === "sale") return !!product.onSale;
    
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Search & Filter Header */}
      <section className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div className="w-full md:w-5/12">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary mb-4 leading-tight">Curated Collection</h2>
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search elegance..."
              className="w-full bg-transparent border-0 border-b border-outline-variant pl-8 pr-4 py-2 focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-sans text-sm pb-2 placeholder:text-on-surface-variant/40 outline-none text-on-surface font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-outline font-sans hover:text-primary transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-6 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer ${
              selectedTab === "all"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedTab("clothes")}
            className={`px-6 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer ${
              selectedTab === "clothes"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
            }`}
          >
            Clothes
          </button>
          <button
            onClick={() => setSelectedTab("books")}
            className={`px-6 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer ${
              selectedTab === "books"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setSelectedTab("sale")}
            className={`px-6 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 border cursor-pointer ${
              selectedTab === "sale"
                ? "bg-secondary text-white border-secondary shadow-sm"
                : "border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white"
            }`}
          >
            On Sale %
          </button>
        </div>
      </section>

      {/* Skeletons vs Product Listing Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Elegant skeleton pulse grid loader */
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg overflow-hidden border border-surface-container-high h-[500px] shadow-sm animate-pulse space-y-6"
              >
                <div className="h-80 bg-surface-variant/40 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-surface-variant/40 rounded w-3/4" />
                  <div className="h-4 bg-surface-variant/40 rounded w-1/2" />
                  <div className="h-4 bg-surface-variant/40 rounded w-2/3" />
                  <div className="h-10 bg-surface-variant/40 rounded-full w-full mt-4" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          /* Zero state search results */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white border border-surface-container-high rounded-xl text-center space-y-4 px-6 shadow-sm"
          >
            <AlertCircle className="w-12 h-12 text-outline-variant" />
            <h3 className="font-serif text-xl font-bold text-primary">No Curated Items Match</h3>
            <p className="font-sans text-sm text-on-surface-variant max-w-md">
              Try adjusting your query or filters. We are constantly expanding our collection with custom elegant wear and new books.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTab("all");
              }}
              className="text-xs font-semibold tracking-wider font-sans uppercase text-primary border-b border-primary hover:text-secondary hover:border-secondary transition-all cursor-pointer pb-0.5"
            >
              Reset Search Filter
            </button>
          </motion.div>
        ) : (
          /* Products Grid with Entrance Slide Animation */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-surface-container-high hover:border-surface-container-highest flex flex-col lift-hover"
              >
                {/* Image Section with interactive hover zoom and badges */}
                <div className="h-80 overflow-hidden relative bg-surface-container flex items-center justify-center p-0">
                  <img
                    alt={product.title}
                    src={product.image}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  />
                  
                  {/* Status badges */}
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-secondary-container" />
                      <span>New</span>
                    </div>
                  )}

                  {product.onSale && (
                    <div className="absolute top-4 left-4 bg-secondary text-white font-sans text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>-20% Sale</span>
                    </div>
                  )}
                </div>

                {/* Listing content and Order actions */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-outline-variant font-mono">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-primary mb-2 tracking-tight group-hover:text-secondary transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant flex-grow mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-container">
                    <div className="flex flex-col">
                      {product.onSale ? (
                        <>
                          <span className="font-sans text-xs text-on-surface-variant/40 line-through">
                            KSh {product.originalPrice?.toLocaleString()}
                          </span>
                          <span className="font-sans font-bold text-base md:text-lg text-secondary">
                            KSh {product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-sans font-bold text-base md:text-lg text-primary">
                          KSh {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onAddToCart(product)}
                      className="inline-flex items-center gap-2 bg-primary text-white font-sans text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
