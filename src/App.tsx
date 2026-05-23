import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, ShieldAlert } from "lucide-react";
import { User } from "firebase/auth";

// Components
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeView from "./components/HomeView";
import ShopView from "./components/ShopView";
import ContactView from "./components/ContactView";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import CartModal from "./components/CartModal";

// Initial Mock Data and Types
import { Product, CartItem, ContactMessage, Order, ScreenType } from "./types";
import { INITIAL_PRODUCTS, INITIAL_MESSAGES, INITIAL_ORDERS } from "./data";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from "./firebase";
import { 
  testFirestoreConnection, 
  queryProducts, 
  queryMessages, 
  queryOrders, 
  createProduct, 
  removeProduct, 
  submitContactMessage, 
  markMessageReadStatus, 
  purgeMessage, 
  createOrder, 
  updateOrderStatus 
} from "./db";

export default function App() {
  // Screen and interactive drawer states
  const [currentScreen, setScreen] = useState<ScreenType>("home");
  const [cartOpen, setCartOpen] = useState(false);

  // Unified persistent or runtime state directories
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Google Workspace Authorized login credentials
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Log notifications inside the UI when active changes occur
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Synchronize with database on initialization
  useEffect(() => {
    testFirestoreConnection();

    // Load actual DB streams
    const bootstrapCatalog = async () => {
      try {
        const prodData = await queryProducts();
        setProducts(prodData);
      } catch (err) {
        console.warn("Product bootstrap failed (using initial fallback state):", err);
        setProducts(INITIAL_PRODUCTS);
      }

      try {
        const msgData = await queryMessages();
        setMessages(msgData);
      } catch (err) {
        console.warn("Message bootstrap failed (using initial fallback state):", err);
        setMessages(INITIAL_MESSAGES);
      }

      try {
        const orderData = await queryOrders();
        setOrders(orderData);
      } catch (err) {
        console.warn("Order bootstrap failed (using initial fallback state):", err);
        setOrders(INITIAL_ORDERS);
      }
    };
    bootstrapCatalog();

    // Bind Google Auth triggers
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );

    return () => unsub();
  }, []);

  // Re-fetch messages and orders dynamically when authentication shifts or admin dashboard is opened
  useEffect(() => {
    const reloadAdminResources = async () => {
      try {
        const msgData = await queryMessages();
        setMessages(msgData);
      } catch (err) {
        console.warn("Messages background refresh bypassed:", err);
      }

      try {
        const orderData = await queryOrders();
        setOrders(orderData);
      } catch (err) {
        console.warn("Orders background refresh bypassed:", err);
      }
    };
    reloadAdminResources();
  }, [googleUser, currentScreen]);

  // Sync token asynchronously if available
  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        showToast(`Connected successfully to Google Workspace as ${result.user.email}!`);
      }
    } catch (err: any) {
      console.error("OAuth login failure:", err);
      showToast(`Workspace Connection Failed: ${err.message || err}`);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      showToast("Cleared Google Workspace credentials.");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Add Item to cart with quantity multiplier logic
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        showToast(`Increased quantity of ${product.title} in your bag!`);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        showToast(`Added ${product.title} to your bag!`);
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    // Open cart drawer immediately to provide seamless checkout response
    setCartOpen(true);
  };

  // Submit contact message inquiry
  const handleAddMessage = (msgData: Omit<ContactMessage, "id" | "date" | "isRead">) => {
    const newMessage: ContactMessage = {
      ...msgData,
      id: "msg-" + Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      isRead: false
    };
    submitContactMessage(newMessage).then(() => {
      setMessages((prev) => [newMessage, ...prev]);
      showToast(`Inquiry sent! Susan's Company staff notified.`);
    }).catch(err => {
      console.error("Failed writing consultation ticket:", err);
      showToast("Submission failed. Check Console rules.");
    });
  };

  // Placing a new customer order from Checkout Form
  const handlePlaceOrder = (
    customerName: string,
    customerPhone: string,
    deliveryLocation: string,
    paymentMethod: string
  ) => {
    const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const newOrder: Order = {
      id: (1043 + Math.floor(Math.random() * 900)).toString(),
      customerName,
      customerPhone,
      items: [...cart],
      totalAmount,
      status: "pending",
      deliveryLocation,
      paymentMethod,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    createOrder(newOrder).then(() => {
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      showToast(`Order placed! Fulfill reference #${newOrder.id} inside Admin Log.`);
    }).catch(err => {
      console.error("Failed adding order:", err);
      showToast("Order transaction rejected by Database rules.");
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-20 pb-[76px] md:pb-0 overflow-x-hidden antialiased">
      {/* 1. Header Navigation Component */}
      <Header
        currentScreen={currentScreen}
        setScreen={setScreen}
        cart={cart}
        setCartOpen={setCartOpen}
      />

      {/* 2. Main Content Screens Layout (with smooth fade exits) */}
      <main className="flex-grow w-full">
        <div className={`px-0 py-0 ${currentScreen === 'admin-dashboard' ? 'max-w-none' : 'max-w-7xl mx-auto px-5 md:px-12 py-10'}`}>
          <AnimatePresence mode="wait">
            {currentScreen === "home" && (
              <HomeView
                setScreen={setScreen}
                products={products}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentScreen === "shop" && (
              <ShopView
                products={products}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentScreen === "contact" && (
              <ContactView
                onAddMessage={handleAddMessage}
              />
            )}

            {currentScreen === "admin-login" && (
              <AdminLogin
                setScreen={setScreen}
              />
            )}

            {currentScreen === "admin-dashboard" && (
              <AdminDashboard
                setScreen={setScreen}
                products={products}
                setProducts={setProducts}
                messages={messages}
                setMessages={setMessages}
                orders={orders}
                setOrders={setOrders}
                googleUser={googleUser}
                googleToken={googleToken}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. Interactive Floating Toast Notification Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 left-6 right-6 md:left-auto md:right-8 bg-primary-container border border-on-primary-container text-white px-5 py-3.5 rounded-xl shadow-lg z-50 flex items-center gap-3 max-w-sm"
          >
            <MessageSquare className="w-5 h-5 text-secondary shrink-0" />
            <div className="text-left font-sans text-xs font-semibold leading-relaxed">
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Desktop-only indicator link for quick testing access */}
      {currentScreen !== "admin-dashboard" && (
        <button
          onClick={() => {
            if (currentScreen === "admin-dashboard") {
              setScreen("home");
            } else {
              setScreen("admin-login");
            }
          }}
          className="hidden md:flex fixed bottom-8 left-8 z-40 bg-white/90 hover:bg-white text-primary hover:text-secondary p-3 rounded-full border border-surface-container-high transition-all shadow-md items-center gap-2 cursor-pointer duration-300 font-sans text-xs font-bold leading-none select-none hover:-translate-y-0.5"
          title="Staff Portal Login"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-secondary" />
          <span>Staff Portal</span>
        </button>
      )}

      {/* 5. Floating WhatsApp Support Icon */}
      {currentScreen !== "admin-dashboard" && (
        <a
          href="https://wa.me/254700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          title="Chat with Susan's Company"
        >
          {/* Ring pulse wave effect */}
          <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-75 pointer-events-none" />
          <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
            {/* WhatsApp standard Forum logo or Lucide icon representation */}
            <MessageSquare className="w-6 h-6 fill-white text-primary" />
          </div>
        </a>
      )}

      {/* 6. Active Shopping Bag Drawer Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <CartModal
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            setCart={setCart}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </AnimatePresence>

      {/* 7. Bottom Navigation (Mobile Only) */}
      <BottomNav
        currentScreen={currentScreen}
        setScreen={setScreen}
      />
    </div>
  );
}
