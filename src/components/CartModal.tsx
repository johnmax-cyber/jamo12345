import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, X, Trash2, CreditCard, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";
import { CartItem, Product, Order } from "../types";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onPlaceOrder: (customerName: string, customerPhone: string, deliveryLocation: string, paymentMethod: string) => void;
}

export default function CartModal({ isOpen, onClose, cart, setCart, onPlaceOrder }: CartModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Delete cart item or reduce quantity
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Checkout submit
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Please enter your name for delivery packing tags.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("Please enter a phone number so we can coordinate delivery.");
      return;
    }
    if (!deliveryLocation) {
      setErrorMessage("Please select a deliveries area in Nairobi.");
      return;
    }

    setIsSubmitting(true);

    // Simulate safe Nairobi payment gateway and order persistence
    setTimeout(() => {
      onPlaceOrder(customerName, customerPhone, deliveryLocation, paymentMethod);
      
      const newId = (1043 + Math.floor(Math.random() * 900)).toString();
      setGeneratedId(newId);
      setIsSubmitting(false);
      setCheckoutSuccess(true);
      
      // Clear inputs
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryLocation("");
      setPaymentMethod("M-Pesa");
    }, 1100);
  };

  const handleCloseSuccess = () => {
    setCheckoutSuccess(false);
    setCart([]);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black cursor-pointer pointer-events-auto"
        transition={{ duration: 0.3 }}
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 220, mass: 1 }}
        className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between z-10 text-on-surface"
      >
        {/* Header container */}
        <div className="px-6 py-5 border-b border-surface-container-high flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5.5 h-5.5 text-primary" />
            <h2 className="font-serif text-lg lg:text-xl font-bold text-primary">Your Bag</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary pointer-events-auto p-1.5 rounded-full hover:bg-surface-container-low transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer contents */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
          <AnimatePresence mode="wait">
            {checkoutSuccess ? (
              /* Success Checkout Overlay */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary">Asante! Order Confirmed</h3>
                
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high w-full space-y-2">
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Showroom tag reference: <span className="font-semibold text-primary font-mono">#{generatedId}</span>
                  </p>
                  <p className="font-sans text-[11px] text-on-surface-variant/75">
                    Your shipment is active. Our Nairobi staff will contact you on your phone line within minutes to initiate delivery tracking!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="w-full bg-primary text-white text-xs uppercase font-bold tracking-wider py-3 rounded-full hover:border border-primary transition-all active:scale-95 cursor-pointer"
                >
                  Continue Browsing
                </button>
              </motion.div>
            ) : cart.length === 0 ? (
              /* Empty state */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-20 space-y-4"
              >
                <ShoppingBag className="w-12 h-12 text-outline-variant opacity-60 animate-pulse" />
                <h3 className="font-serif text-lg font-bold text-primary">Bag holds no items</h3>
                <p className="font-sans text-xs text-on-surface-variant max-w-[15rem] leading-relaxed mx-auto font-light">
                  Explore our curated modest abayas, clothes, and traditional books and add products here.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs uppercase font-semibold font-sans tracking-wide text-primary border-b border-primary hover:text-secondary hover:border-secondary transition-all pb-0.5 cursor-pointer"
                >
                  Explore Collections
                </button>
              </motion.div>
            ) : (
              /* Active Bag list & Checkout triggers */
              <motion.div
                key="active-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* List items */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-surface-container-low border border-surface-container-high rounded-xl relative group">
                      <div className="w-14 h-16 bg-surface-container-highest rounded-lg overflow-hidden border border-outline-variant shrink-0">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-sans font-semibold text-sm text-primary truncate">{item.product.name}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717971] font-mono mt-0.5">{item.product.category}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-sans text-on-surface-variant font-medium">Quantity: {item.quantity}</span>
                          <span className="font-sans font-bold text-primary">KSh {(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="p-1 px-1.5 absolute top-2 right-2 text-outline-variant hover:text-error hover:bg-error/5 rounded-full transition-all cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bill details */}
                <div className="bg-surface-container rounded-xl p-4.5 space-y-4 shadow-sm border border-surface-container-high text-left">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium uppercase tracking-wide">
                    <span>Subtotal:</span>
                    <span className="font-sans font-semibold">KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium uppercase tracking-wide pb-3 border-b border-surface-container-high">
                    <span>Nairobi Delivery / Handling:</span>
                    <span className="font-sans font-semibold text-green-700 font-mono tracking-wider">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-primary font-bold">
                    <span>Est. Total Amount:</span>
                    <span className="font-serif text-base lg:text-lg">KSh {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Fields form */}
                <div className="border-t border-surface-container-high pt-6 text-left">
                  <h3 className="font-serif text-base lg:text-lg font-bold text-primary mb-4">Secure Checkout</h3>
                  
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="flex items-center gap-2 bg-error/5 p-2.5 rounded-lg text-xs font-semibold text-error border border-error/20">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Halima Amina"
                        className="w-full border border-outline-variant rounded-xl px-4.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Showroom Mobile
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+254 700 000 000"
                          className="w-full border border-outline-variant rounded-xl px-4.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Delivery Zone
                        </label>
                        <select
                          required
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          className="w-full border border-outline-variant rounded-xl px-4.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface cursor-pointer appearance-none"
                        >
                          <option value="">Select location</option>
                          <option value="Westlands, Nairobi">Westlands showroom pick (Free)</option>
                          <option value="Kilimani, Nairobi">Kilimani Delivery</option>
                          <option value="Karen, Nairobi">Karen Delivery / Estate Drop</option>
                          <option value="Lavington, Nairobi">Lavington Delivery</option>
                          <option value="Runda / Gigiri, Nairobi">Runda &amp; Gigiri Residency</option>
                          <option value="Nairobi CBD Office">Central Nairobi CBD offices</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Payment Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("M-Pesa")}
                          className={`px-4 py-2.5 rounded-xl border text-center font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            paymentMethod === "M-Pesa"
                              ? "bg-primary text-white border-primary"
                              : "border-outline-variant bg-transparent text-on-surface-variant"
                          }`}
                        >
                          M-Pesa
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Cash")}
                          className={`px-4 py-2.5 rounded-xl border text-center font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            paymentMethod === "Cash"
                              ? "bg-primary text-white border-primary"
                              : "border-outline-variant bg-transparent text-on-surface-variant"
                          }`}
                        >
                          Cash Tag
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-1 hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer active:scale-98 mt-4"
                    >
                      {isSubmitting ? (
                        <span>Completing Checkout...</span>
                      ) : (
                        <>
                          <span>Submit Showroom Order</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
