import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Shirt, Mail, ListOrdered, LogOut, CheckSquare, 
  Trash2, Plus, X, Menu, ShoppingBag, MessageSquare, AlertTriangle, 
  CheckCircle, Shirt as ProductIcon, Inbox, CreditCard, ChevronRight, Phone, MapPin, DollarSign,
  Cloud, Calendar as CalendarIcon, Send, ShieldCheck, RefreshCw, FileText, Check, AlertCircle, Sparkles, Database,
  ArrowUpDown
} from "lucide-react";
import { User } from "firebase/auth";
import { Product, ContactMessage, Order, ScreenType } from "../types";
import { 
  uploadFileToDrive, 
  listDriveBackupFiles, 
  sendGmailMessage, 
  createCalendarEvent, 
  fetchCalendarEvents 
} from "../workspace";
import { 
  createProduct, 
  removeProduct, 
  markMessageReadStatus, 
  purgeMessage, 
  updateOrderStatus 
} from "../db";
import {
  testSupabaseConnection,
  syncProductToSupabase,
  syncMessageToSupabase,
  syncOrderToSupabase,
  SUPABASE_URL
} from "../supabase";


interface AdminDashboardProps {
  setScreen: (screen: ScreenType) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  googleUser: User | null;
  googleToken: string | null;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
}

type AdminTab = "overview" | "products" | "messages" | "orders" | "workspace";

export default function AdminDashboard({
  setScreen,
  products,
  setProducts,
  messages,
  setMessages,
  orders,
  setOrders,
  googleUser,
  googleToken,
  onGoogleLogin,
  onGoogleLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form states for creating a new product
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState<"clothes" | "books">("clothes");
  const [newProductImage, setNewProductImage] = useState("");
  const [productError, setProductError] = useState("");

  // Google Calendar Integration states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calSummary, setCalSummary] = useState("Bespoke Fitting Consultation");
  const [calDescription, setCalDescription] = useState("Custom size measurement session at Susan's Nairobi showroom.");
  const [calStartDate, setCalStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [calEndDate, setCalEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [calCreating, setCalCreating] = useState(false);
  const [calError, setCalError] = useState("");

  // Google Drive Integration states
  const [driveBackups, setDriveBackups] = useState<any[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");

  // Gmail Custom Outreach builder states
  const [gmailRecipient, setGmailRecipient] = useState("johnmax4354@gmail.com");
  const [gmailSubject, setGmailSubject] = useState("Fittings & Styling Welcome — Susan's Closet");
  const [gmailContent, setGmailContent] = useState("<p>Dear Valued Client,<br><br>Your custom tailoring request has been accepted by Susan's design team in Nairobi. We are excited to schedule your fit measurement appointment!</p>");
  const [gmailTemplate, setGmailTemplate] = useState("consultation");
  const [gmailSending, setGmailSending] = useState(false);
  const [gmailStatus, setGmailStatus] = useState("");

  // Supabase Sync Center states
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [supabaseChecking, setSupabaseChecking] = useState(false);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState("");
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);

  // Sorting state for active order fulfillment lists
  const [orderSort, setOrderSort] = useState<"newest" | "oldest" | "amount_desc">("newest");

  // Helper date parsing routine to support both absolute date-stamps and relative strings
  const parseOrderDate = (dateStr: string): Date => {
    const now = new Date();
    const lower = dateStr.toLowerCase();
    
    if (lower.includes("min ago")) {
      const mins = parseInt(lower.match(/\d+/)?.[0] || "0", 10);
      return new Date(now.getTime() - mins * 60 * 1000);
    }
    if (lower.includes("hour ago") || lower.includes("hours ago")) {
      const hours = parseInt(lower.match(/\d+/)?.[0] || "1", 10);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }
    if (lower.includes("yesterday")) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }
    if (lower.includes("days ago")) {
      const days = parseInt(lower.match(/\d+/)?.[0] || "2", 10);
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    }
    
    // Add current year fallback for simple month-day strings "May 21, 08:24 PM" if not present
    let formatStr = dateStr;
    if (!formatStr.includes("202")) {
      formatStr = formatStr + ", " + now.getFullYear();
    }
    const timestamp = Date.parse(formatStr);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    return now;
  };

  // Memoized, dynamically sorted list of current customer orders
  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      if (orderSort === "newest") {
        return parseOrderDate(b.date).getTime() - parseOrderDate(a.date).getTime();
      }
      if (orderSort === "oldest") {
        return parseOrderDate(a.date).getTime() - parseOrderDate(b.date).getTime();
      }
      if (orderSort === "amount_desc") {
        return b.totalAmount - a.totalAmount;
      }
      return 0;
    });
  }, [orders, orderSort]);

  // Stats calculations
  const totalProducts = products.length;
  const newMessagesCount = messages.filter(m => !m.isRead).length;
  const pendingOrdersCount = orders.filter(o => o.status === "pending").length;

  // On mount, verify Supabase credentials and database accessibility
  useEffect(() => {
    const checkSupa = async () => {
      setSupabaseChecking(true);
      const ok = await testSupabaseConnection();
      setSupabaseConnected(ok);
      setSupabaseChecking(false);
    };
    checkSupa();
  }, []);

  const handleVerifySupabase = async () => {
    setSupabaseChecking(true);
    setSupabaseSyncStatus("");
    const ok = await testSupabaseConnection();
    setSupabaseConnected(ok);
    setSupabaseChecking(false);
    if (ok) {
      setSupabaseSyncStatus("Connected to Supabase endpoint successfully.");
    } else {
      setSupabaseSyncStatus("Failed to contact Supabase. Please verify table schemas or API credentials.");
    }
  };

  const handleSyncAllToSupabase = async () => {
    setSupabaseSyncing(true);
    setSupabaseSyncStatus("");
    let productsOkCount = 0;
    let messagesOkCount = 0;
    let ordersOkCount = 0;
    let errors: string[] = [];

    try {
      // 1. Sync Products
      for (const p of products) {
        const res = await syncProductToSupabase(p);
        if (res.success) productsOkCount++;
        else if (res.error) errors.push(`Product ${p.id}: ${res.error}`);
      }

      // 2. Sync Messages
      for (const m of messages) {
        const res = await syncMessageToSupabase(m);
        if (res.success) messagesOkCount++;
        else if (res.error) errors.push(`Message ${m.id}: ${res.error}`);
      }

      // 3. Sync Orders
      for (const o of orders) {
        const res = await syncOrderToSupabase(o);
        if (res.success) ordersOkCount++;
        else if (res.error) errors.push(`Order ${o.id}: ${res.error}`);
      }

      let summary = `Sync Summary: ${productsOkCount}/${products.length} Products, ${messagesOkCount}/${messages.length} Messages, ${ordersOkCount}/${orders.length} Orders successfully uploaded.`;
      if (errors.length > 0) {
        summary += ` Note: Some tables might require SQL configuration. First error: ${errors[0]}`;
      }
      setSupabaseSyncStatus(summary);
    } catch (err: any) {
      setSupabaseSyncStatus(`Sync aborted with exception: ${err.message || err}`);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  // Sync Drive lists and Calendar slots on connected OAuth session
  useEffect(() => {
    if (googleToken) {
      loadWorkspaceSync();
    }
  }, [googleToken]);

  const loadWorkspaceSync = async () => {
    try {
      if (!googleToken) return;
      setCalendarLoading(true);
      setDriveLoading(true);
      
      const events = await fetchCalendarEvents(googleToken);
      setCalendarEvents(events);
      
      const files = await listDriveBackupFiles(googleToken);
      setDriveBackups(files);
    } catch (err: any) {
      console.error("Workspace details download issue:", err);
    } finally {
      setCalendarLoading(false);
      setDriveLoading(false);
    }
  };

  // Preset email templates selector
  useEffect(() => {
    if (gmailTemplate === "consultation") {
      setGmailSubject("Fittings & Styling Welcome — Susan's Closet");
      setGmailContent(`<h2>Susan's Closet Consultation Welcome</h2>
<p>Dear Valued Client,</p>
<p>Thank you for submitting your custom clothing inquiry to Susan's Closet. We have generated a custom workspace schedule slot for your tailoring measurements session at our showroom.</p>
<p>Kindly verify your coordinates or click to synchronize events. We look forward to realizing your fashion aspirations.</p>
<p>Warm regards,<br><b>Susan's Nairobi Design Team</b></p>`);
    } else if (gmailTemplate === "receipt") {
      setGmailSubject("Showroom Product Shipment Verified — Susan's Company");
      const orderSample = orders[0] || { id: "1041", customerName: "Grace M.", totalAmount: 15700 };
      setGmailContent(`<h2>Payment Receipt - Susan's Company</h2>
<p>Dear ${orderSample.customerName},</p>
<p>We are delighted to confirm receipt of your checkout request <b>Order #${orderSample.id}</b>.</p>
<p>Our Nairobi logistic dispatch riders are bundling your modest apparel items safely. Your invoice totals <b>KSh ${(orderSample.totalAmount).toLocaleString()}</b>. Tracking notifications will be dispatched over celular.</p>
<p>Thank you for shopping with Susan's Closet!</p>`);
    } else {
      setGmailSubject("VIP Boutiques Autumn Catalog Launch — Susan's Company");
      setGmailContent(`<h2>Premium Collection Catalog Launch</h2>
<p>Hello Boutique Partner,</p>
<p>We have uploaded our complete latest autumn catalogue backups directly to cooperative Google Drive directories.</p>
<p>We feature premium crepe Abayas, tailored silk Tunics, and handcrafted jewelry batches configured direct from Nairobi's local artisans.</p>
<p>Talk to Susan's sales desk representation for immediate pre-order priority pricing.</p>`);
    }
  }, [gmailTemplate, orders]);

  // Handle deleting a product
  const handleDeleteProduct = (id: string) => {
    removeProduct(id).then(() => {
      setProducts(products.filter(p => p.id !== id));
    }).catch(err => {
      console.error("Firestore product deletion failure:", err);
    });
  };

  // Handle deleting a message
  const handleDeleteMessage = (id: string) => {
    purgeMessage(id).then(() => {
      setMessages(messages.filter(m => m.id !== id));
    }).catch(err => {
      console.error("Firestore message purge error:", err);
    });
  };

  // Handle marking message as read
  const handleMarkMessageRead = (id: string) => {
    markMessageReadStatus(id, true).then(() => {
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    }).catch(err => {
      console.error("Firestore update read status error:", err);
    });
  };

  // Handle completing order
  const handleCompleteOrder = (id: string) => {
    updateOrderStatus(id, "completed").then(() => {
      setOrders(orders.map(o => o.id === id ? { ...o, status: "completed" } : o));
    }).catch(err => {
      console.error("Firestore complete order error:", err);
    });
  };

  // Handle cancelling order
  const handleCancelOrder = (id: string) => {
    updateOrderStatus(id, "cancelled").then(() => {
      setOrders(orders.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
    }).catch(err => {
      console.error("Firestore cancel order error:", err);
    });
  };

  // Form submission for adding custom product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    if (!newProductTitle.trim()) {
      setProductError("Product title is required.");
      return;
    }
    const priceNum = parseFloat(newProductPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setProductError("Please enter a valid price (greater than 0).");
      return;
    }

    const defaultImages = {
      clothes: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJDefvoRxLtMviu-8ugwXfD7QBPcW74j4VcPa-fDoUusjpOtyr7IZ2xa1afiZJlT_EO6ZncBYaoQw2ZgGqiiyyZkofvOxwoIr2WiCgmXRmkGqT4mgvfGh-HS9edS1vxrIN03HoMHJCZc0tEDouQrDIqE3vBKcr-qNuVMwVEqCBTZWcqZtmJPhY2ms-DrIvtkrmA6REHPMM-9W_59jmpYVhS-TZlJjrX3Zf7L1olnkH_daKkFZ0B-Q1DmGm7P4N2OKzJfs1EIIn75w1",
      books: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiIlqxhbHfeAPJF-SPs3lN9EUKJua_2YD1C2FlqyvzabPExgEw-A53e_pzBDt0uAumh701DI-qAYS15b1rgUgoCAigutOViGW2FbRc7EIqfjLhd6Ala-hdj4pwMUZjkRjQyPIRphNm1NeU1jwYUiD6rlEYvxxStv51NuZihq2w_5UaD4hS_bZUu2bjYHFLQIscZCbBHnqP_O7WkJafvLF1wB1uehWlgwqo8lJk9yF4YLUc3YhnK7EHQLnHgx1b9yeE8aPgFtoy0i1q"
    };

    const newProduct: Product = {
      id: "p-" + Date.now(),
      title: newProductTitle,
      description: newProductDescription || "Exquisite addition to Susan's Company Nairobi curated collections.",
      price: priceNum,
      category: newProductCategory,
      image: newProductImage.trim() || defaultImages[newProductCategory],
      isNew: true
    };

    createProduct(newProduct).then(() => {
      setProducts([newProduct, ...products]);
      setIsAddingProduct(false);

      // Reset inputs
      setNewProductTitle("");
      setNewProductDescription("");
      setNewProductPrice("");
      setNewProductImage("");
    }).catch(err => {
      console.error("Firestore write product issue:", err);
      setProductError("Exception inserting product. Access Denied by Firebase rules.");
    });
  };

  // Google Calendar booking action
  const handleBookCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalError("");
    if (!googleToken) {
      setCalError("First connect your Google Workspace session below.");
      return;
    }
    
    setCalCreating(true);
    try {
      await createCalendarEvent(googleToken, {
        summary: calSummary,
        description: calDescription,
        start: { dateTime: new Date(calStartDate).toISOString(), timeZone: "Africa/Nairobi" },
        end: { dateTime: new Date(calEndDate).toISOString(), timeZone: "Africa/Nairobi" }
      });
      // Success, refresh schedules
      const events = await fetchCalendarEvents(googleToken);
      setCalendarEvents(events);
      setCalSummary("Bespoke Fitting Consultation");
      setCalDescription("Custom size measurement session at Susan's Nairobi showroom.");
      alert(`Success! Scheduled brand event on Google Calendar.`);
    } catch (err: any) {
      console.error(err);
      setCalError(err.message || "Failed to make Google Calendar reservation.");
    } finally {
      setCalCreating(false);
    }
  };

  // Google Drive catalog backup triggers
  const handleBackupCatalogToDrive = async () => {
    if (!googleToken) return;
    setDriveLoading(true);
    setBackupMessage("");
    try {
      // Create readable text content of catalog
      let text = "=== SUSANS APP CATALOG PRODUCTS BACKUP ===\n\n";
      products.forEach((p, idx) => {
        text += `${idx + 1}. [${p.category.toUpperCase()}] ${p.title} - KSh ${p.price}\n`;
        text += `   Desc: ${p.description}\n`;
        text += `   Image: ${p.image}\n\n`;
      });
      
      const fileName = `Susan_Company_Catalog_Backup_${Date.now()}.txt`;
      await uploadFileToDrive(googleToken, fileName, text, "text/plain");
      setBackupMessage(`Successfully bundled catalog into Google Drive: "${fileName}"!`);
      
      // Reload backups list
      const files = await listDriveBackupFiles(googleToken);
      setDriveBackups(files);
    } catch (err: any) {
      setBackupMessage(`Drive backup failed: ${err.message || err}`);
    } finally {
      setDriveLoading(false);
    }
  };

  const handleBackupOrdersToDrive = async () => {
    if (!googleToken) return;
    setDriveLoading(true);
    setBackupMessage("");
    try {
      let text = "=== SUSANS SHOWROOM ORDERS LOGS BACKUP ===\n\n";
      orders.forEach((o, idx) => {
        text += `${idx + 1}. Order #${o.id} - ${o.customerName} (${o.customerPhone}) - Status: ${o.status.toUpperCase()}\n`;
        text += `   Place: ${o.deliveryLocation} | Payment: ${o.paymentMethod}\n`;
        text += `   Total KSh ${o.totalAmount} | Items: ${o.items.length}\n\n`;
      });
      
      const fileName = `Susan_Company_Orders_Backup_${Date.now()}.txt`;
      await uploadFileToDrive(googleToken, fileName, text, "text/plain");
      setBackupMessage(`Successfully archived Orders ledger into Google Drive: "${fileName}"`);
      
      // Reload backups list
      const files = await listDriveBackupFiles(googleToken);
      setDriveBackups(files);
    } catch (err: any) {
      setBackupMessage(`Orders backup failed: ${err.message || err}`);
    } finally {
      setDriveLoading(false);
    }
  };

  // Gmail email sending action
  const handleSendGmailOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    setGmailStatus("");
    if (!googleToken) {
      setGmailStatus("Authenticate with Google Account first.");
      return;
    }
    
    setGmailSending(true);
    try {
      await sendGmailMessage(googleToken, gmailRecipient, gmailSubject, gmailContent);
      setGmailStatus("SENT");
      setTimeout(() => setGmailStatus(""), 3000);
    } catch (err: any) {
      setGmailStatus(`Error: ${err.message || err}`);
    } finally {
      setGmailSending(false);
    }
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { id: "products", label: "Products Catalog", icon: Shirt, badge: 0 },
    { id: "messages", label: "Messages Inbox", icon: Mail, badge: newMessagesCount },
    { id: "orders", label: "Orders Fulfillment", icon: ListOrdered, badge: pendingOrdersCount },
    { id: "workspace", label: "Workspace Center", icon: Cloud, badge: 0 }
  ];

  return (
    <div className="w-full flex min-h-screen text-on-surface">
      {/* 1. Sidebar Panel (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-surface-container-high py-8 px-6 justify-between shrink-0">
        <div>
          <div className="mb-10 text-left">
            <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">Susan's Company</h1>
            <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant font-mono mt-1">
              Admin Portal
            </p>
          </div>

          <nav className="flex flex-col gap-2 w-full text-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-sans text-xs font-semibold tracking-wide cursor-pointer text-left w-full ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="flex-grow">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      activeTab === item.id ? "bg-white text-primary" : "bg-primary text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <button
            onClick={() => setScreen("home")}
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-sans text-xs font-semibold text-error hover:bg-error/5 cursor-pointer text-left w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Header/Sidebar Toggle */}
      <nav className="lg:hidden fixed top-20 left-0 w-full z-45 bg-white border-b border-surface-container-high px-5 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-primary hover:text-secondary p-1"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          <span className="font-serif font-bold text-sm text-primary">Portal — Admin Overview</span>
        </div>

        <button
          onClick={() => setScreen("home")}
          className="text-xs font-semibold uppercase font-sans text-error px-3 py-1 bg-error/5 rounded-full"
        >
          Logout
        </button>
      </nav>

      {/* 3. Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white border-r border-surface-container-high py-8 px-6 flex flex-col justify-between z-50 lg:hidden"
            >
              <div>
                <div className="flex justify-between items-center mb-10">
                  <div className="text-left">
                    <h1 className="font-serif text-xl font-bold text-primary max-w-[12rem]">Susan's Company</h1>
                    <p className="font-sans text-[10px] uppercase text-outline mt-1 font-semibold font-mono">Admin Portal</p>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2 text-left w-full">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as AdminTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-sans text-xs font-semibold cursor-pointer text-left w-full ${
                          activeTab === item.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span className="flex-grow">{item.label}</span>
                        {item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === item.id ? "bg-white text-primary" : "bg-primary text-white"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setScreen("home");
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-sans text-xs font-semibold text-error hover:bg-error/5 cursor-pointer text-left w-full"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Exit Portal</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Main Contents Area */}
      <main className="flex-1 overflow-y-auto px-5 lg:px-12 py-10 pt-36 lg:pt-10 bg-surface-container-low min-h-screen">
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-primary">Overview</h2>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1">
                  Welcome back to the secure management dashboard, Susan.
                </p>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Products Stat */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center justify-between relative z-10 select-none">
                    <span className="p-2.5 bg-primary-container text-on-primary-container rounded-xl">
                      <ProductIcon className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="mt-6 relative z-10">
                    <h3 className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#717971]">Total Products</h3>
                    <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-1">{totalProducts}</p>
                  </div>
                </div>

                {/* Messages Stat */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="p-2.5 bg-secondary-container text-on-secondary-container rounded-xl">
                      <Inbox className="w-5 h-5" />
                    </span>
                    {newMessagesCount > 0 && (
                      <span className="bg-secondary text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        +{newMessagesCount} New
                      </span>
                    )}
                  </div>
                  <div className="mt-6">
                    <h3 className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#717971]">New Inquiries</h3>
                    <p className="font-serif text-3xl md:text-4xl font-bold text-primary mt-1">{newMessagesCount}</p>
                  </div>
                </div>

                {/* Orders Stat */}
                <div className="bg-primary text-white p-6 rounded-2xl shadow-[0_4px_16px_rgba(0,51,26,0.12)] flex flex-col justify-between relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="p-2.5 bg-white/10 text-white rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-sans text-[10px] uppercase font-bold tracking-widest text-surface-container-highest/70">Orders Pending</h3>
                    <p className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{pendingOrdersCount}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-container-high flex justify-between items-center bg-white">
                  <h3 className="font-serif text-lg font-bold text-primary">Recent Showroom Activities</h3>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className="font-sans text-xs uppercase font-semibold text-secondary hover:text-on-secondary-container transition-colors cursor-pointer"
                  >
                    Manage Orders
                  </button>
                </div>

                <div className="flex flex-col">
                  {/* Dynamic Feed Item 1 (New show room orders) */}
                  {orders.slice(0, 2).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-start gap-4 p-6 hover:bg-surface-container-low transition-colors border-b border-surface-container-high last:border-b-0"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-on-primary-container" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-on-surface">
                          <span className="font-semibold text-primary">New Order #{order.id}</span> placed by {order.customerName}.
                        </p>
                        <p className="font-sans text-xs text-on-surface-variant/75 mt-1">
                          {order.items.length} item(s) &bull; KSh {order.totalAmount.toLocaleString()} &bull; {order.paymentMethod}
                        </p>
                      </div>
                      <div className="shrink-0 text-[11px] font-sans text-outline-variant font-medium">
                        {order.date}
                      </div>
                    </div>
                  ))}

                  {/* Dynamic Feed Item 2 (Feedback) */}
                  {messages.slice(0, 1).map((msg) => (
                    <div 
                      key={msg.id} 
                      className="flex items-start gap-4 p-6 hover:bg-surface-container-low transition-colors border-b border-surface-container-high last:border-b-0"
                    >
                      <div className="w-11 h-11 rounded-xl bg-secondary-container/35 text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-on-secondary-container" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-on-surface">
                          <span className="font-semibold text-primary">Client Inquiry</span> received from {msg.name} regarding {msg.interest}.
                        </p>
                        <p className="font-sans text-xs text-on-surface-variant/75 mt-1 line-clamp-1">
                          "{msg.message}"
                        </p>
                      </div>
                      <div className="shrink-0 text-[11px] font-sans text-outline-variant font-medium">
                        {msg.date}
                      </div>
                    </div>
                  ))}

                  {/* Feed Item 3: System alert */}
                  <div className="flex items-start gap-4 p-6 hover:bg-surface-container-low transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-error/5 text-error flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-on-surface">
                        <span className="font-semibold text-error">System Alert</span>: Restock and catalogue update needed for Silk Blend Hijab (Olive Green).
                      </p>
                      <p className="font-sans text-xs text-on-surface-variant/75 mt-1">
                        Stock below alert safety metrics. Available in boutique shelving: 4.
                      </p>
                    </div>
                    <div className="shrink-0 text-[11px] font-sans text-outline-variant font-medium">
                      2 hours ago
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PRODUCTS CATALOG PANEL */}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary">Showroom Catalog</h2>
                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Manage boutique clothes and book registry indexes.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-primary hover:bg-primary-container hover:text-on-primary-container text-white text-xs font-semibold uppercase tracking-wider font-sans px-5 py-3 rounded-full flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Add Custom Product Modal Popup */}
              <AnimatePresence>
                {isAddingProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingProduct(false)}
                      className="absolute inset-0 bg-black"
                    />
                    
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 relative z-10 shadow-xl border border-outline-variant"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl font-bold text-primary">Add Curated Product</h3>
                        <button onClick={() => setIsAddingProduct(false)} className="text-on-surface-variant hover:text-primary">
                          <X className="w-5 h-5 pointer-events-auto" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateProduct} className="space-y-4">
                        {productError && (
                          <div className="flex items-center gap-2 bg-error/5 p-3 rounded-lg text-xs font-semibold text-error border border-error/20">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{productError}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold font-sans uppercase tracking-wide text-on-surface-variant mb-1">
                            Product Title
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Amber Brocade Kaftan"
                            value={newProductTitle}
                            onChange={(e) => setNewProductTitle(e.target.value)}
                            className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold font-sans uppercase tracking-wide text-on-surface-variant mb-1">
                              Price (KSh)
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 9500"
                              value={newProductPrice}
                              onChange={(e) => setNewProductPrice(e.target.value)}
                              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold font-sans uppercase tracking-wide text-on-surface-variant mb-1">
                              Category
                            </label>
                            <select
                              value={newProductCategory}
                              onChange={(e) => setNewProductCategory(e.target.value as "clothes" | "books")}
                              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface cursor-pointer"
                            >
                              <option value="clothes">衣服 Clothes</option>
                              <option value="books">书籍 Books</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold font-sans uppercase tracking-wide text-on-surface-variant mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Describe fabrics, fittings, or book chapters..."
                            value={newProductDescription}
                            onChange={(e) => setNewProductDescription(e.target.value)}
                            className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold font-sans uppercase tracking-wide text-on-surface-variant mb-1">
                            Cover Image / Photography URL
                          </label>
                          <input
                            type="text"
                            placeholder="Leave blank to auto-pin beautiful default"
                            value={newProductImage}
                            onChange={(e) => setNewProductImage(e.target.value)}
                            className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent text-on-surface"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-primary text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer active:scale-98 mt-4"
                        >
                          Register Product
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Products Catalog Table Grid */}
              <div className="bg-white rounded-2xl border border-surface-container-high shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse font-sans text-sm">
                    <thead>
                      <tr className="bg-surface-container border-b border-surface-container-high text-outline text-xs uppercase tracking-wider font-bold">
                        <th className="py-4 px-6">Product Details</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-surface-container-high last:border-b-0 hover:bg-surface-container-lowest transition-colors">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className="w-12 h-14 bg-surface-container rounded-lg overflow-hidden shrink-0 border border-surface-container-high">
                              <img src={p.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-semibold text-primary">{p.title}</p>
                              <p className="text-xs text-on-surface-variant/75 line-clamp-1 mt-0.5 max-w-sm">{p.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium capitalize text-outline-variant">
                            {p.category}
                          </td>
                          <td className="py-4 px-6 font-semibold text-primary">
                            KSh {p.price.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-error/65 hover:text-error hover:bg-error/5 rounded-full transition-all cursor-pointer inline-flex"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CUSTOMER INQUIRY MESSAGE INBOX */}
          {activeTab === "messages" && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">Client Inbox</h2>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Review direct message submissions and tailoring fitting requests.
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-surface-container-high rounded-2xl text-center space-y-4">
                  <Inbox className="w-12 h-12 text-outline-variant opacity-60 animate-pulse" />
                  <p className="font-sans font-medium text-xs text-on-surface-variant">Your message inbox is completely clear!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`bg-white rounded-2xl p-6 border transition-all text-left flex flex-col sm:flex-row justify-between gap-4 shadow-xs ${
                        msg.isRead ? "border-surface-container-high opacity-80" : "border-primary border-l-4"
                      }`}
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans font-bold text-sm text-primary">{msg.name}</span>
                          <span className="text-xs bg-secondary-container/30 text-secondary px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">
                            {msg.interest}
                          </span>
                          <span className="text-[10px] text-outline ml-auto sm:ml-0">{msg.date}</span>
                        </div>
                        
                        <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
                          "{msg.message}"
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-outline-variant pt-2 border-t border-surface-container">
                          <span className="flex items-center gap-1.5 font-sans">
                            <Phone className="w-3.5 h-3.5 text-outline" />
                            <span>{msg.phone}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center justify-end w-full sm:w-auto">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="bg-primary/5 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Mark Read</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-error bg-error/5 hover:bg-error hover:text-white px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: ORDERS PANEL */}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">Showroom Logistics &amp; Orders</h2>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Fulfill custom orders placed by clients looking for Nairobi deliveries.
                </p>
              </div>

              {/* Advanced Sorting dropdown controls wrapper */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/40 p-4 rounded-xl border border-surface-container-high">
                <div className="text-xs font-sans text-on-surface-variant">
                  Current Orders pool: <span className="font-semibold text-primary">{orders.length} total</span> (<span className="text-secondary font-semibold">{pendingOrdersCount} pending</span>)
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#717971] font-medium flex items-center gap-1 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-secondary" />
                    <span>Sort orders by:</span>
                  </span>
                  <select
                    id="order-sort-selection"
                    value={orderSort}
                    onChange={(e: any) => setOrderSort(e.target.value as any)}
                    className="flex-grow sm:flex-grow-0 bg-white border border-surface-container-high hover:border-[#717971]/45 text-xs text-primary font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px] shadow-xs cursor-pointer h-9"
                  >
                    <option value="newest">Date: Newest</option>
                    <option value="oldest">Date: Oldest</option>
                    <option value="amount_desc">Amount: High to Low</option>
                  </select>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-surface-container-high rounded-2xl text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-outline-variant" />
                  <p className="font-sans font-medium text-xs text-on-surface-variant">There are no orders registered in Susan's database.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedOrders.map((order) => (
                    <div 
                      key={order.id}
                      className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all duration-300 ${
                        order.status === "pending"
                          ? "animate-pulse-pending border-secondary-container"
                          : "border-surface-container-high"
                      }`}
                    >
                      {/* Order Title Box */}
                      <div className="bg-surface-container px-6 py-4.5 border-b border-surface-container-high flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          {order.status === "pending" && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#755b00]/40 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary animate-pulse-indicator"></span>
                            </span>
                          )}
                          <span className="font-sans font-semibold text-primary">Order #{order.id}</span>
                          <span className="text-[10px] text-outline font-medium">{order.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 font-sans text-[10px] uppercase font-bold tracking-wider rounded-full ${
                            order.status === "pending"
                              ? "bg-secondary-container text-on-secondary-container"
                              : order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items and Client details inside */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left Side order items */}
                        <div className="md:col-span-7 space-y-4">
                          <p className="font-sans font-semibold text-xs uppercase tracking-wide text-[#717971]">Registered Purchases</p>
                          <div className="space-y-3">
                            {order.items.map((item, id) => (
                              <div key={id} className="flex items-center gap-3 bg-surface-container-low p-2 rounded-xl">
                                <div className="w-10 h-12 rounded bg-surface border border-surface-container-high overflow-hidden shrink-0">
                                  <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold text-primary text-xs truncate">{item.product.title}</p>
                                  <p className="text-[11px] text-on-surface-variant/75 mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-xs font-semibold text-primary">
                                  KSh {(item.product.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-surface-container-high">
                            <span className="font-sans font-semibold text-xs text-on-surface-variant">Order Total:</span>
                            <span className="font-serif font-bold text-base text-primary">
                              KSh {order.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Right Side client delivery details */}
                        <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-surface-container-high pt-6 md:pt-0 md:pl-6 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <p className="font-sans font-semibold text-xs uppercase tracking-wide text-[#717971]">Delivery Instructions</p>
                            
                            <ul className="space-y-2 text-xs">
                              <li className="flex items-center gap-2">
                                <span className="font-sans font-semibold text-on-surface">Client:</span>
                                <span>{order.customerName}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
                                <span>{order.customerPhone}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                                <span>{order.deliveryLocation}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-secondary shrink-0" />
                                <span>Payment Type: {order.paymentMethod}</span>
                              </li>
                            </ul>
                          </div>

                          {/* Quick workflow updates */}
                          {order.status === "pending" && (
                            <div className="flex gap-2.5 pt-4">
                              <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="flex-1 bg-primary text-white hover:bg-primary-container text-xs font-bold uppercase tracking-wide py-2.5 rounded-full text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Fulfill Order</span>
                              </button>
                              
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="border border-error/20 text-error hover:bg-error/5 text-xs font-bold uppercase tracking-wide py-2.5 rounded-full text-center cursor-pointer transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: GOOGLE WORKSPACE CENTER */}
          {activeTab === "workspace" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-secondary" />
                  <span>Google Workspace Integration Control</span>
                </h2>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Connect and coordinate Susan's enterprise calendar, files backups, and client email workflows seamlessly.
                </p>
              </div>

              {/* Status Section / Sign in Card */}
              <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${googleUser ? "bg-green-100 text-green-700" : "bg-primary/5 text-primary"}`}>
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-base text-primary">
                      {googleUser ? "Google Workspace Connected" : "Connection Required"}
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant font-light mt-0.5">
                      {googleUser 
                        ? `Logged in as ${googleUser.email}. Tokens cached in secure memory.`
                        : "Synchronize your Google Account permissions to begin executing background Workspace triggers."
                      }
                    </p>
                  </div>
                </div>

                {googleUser ? (
                  <button
                    onClick={onGoogleLogout}
                    className="bg-error/5 hover:bg-error hover:text-white text-[#EA4335] font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full transition-all cursor-pointer border border-[#EA4335]/20 hover:border-transparent"
                  >
                    Disconnect Workspace
                  </button>
                ) : (
                  <button
                    onClick={onGoogleLogin}
                    className="gsi-material-button font-sans text-xs flex items-center justify-center gap-2.5 bg-primary text-white hover:bg-secondary transition-all cursor-pointer px-6 py-3.5 rounded-full shadow-md font-bold uppercase tracking-wider h-11"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5 bg-white rounded-full p-0.5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Connect Google Account</span>
                  </button>
                )}
              </div>

              {/* SUPABASE ENTERPRISE DATABASE SYNC MODULE */}
              <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                        <span>Supabase Enterprise Sync Module</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">Operational</span>
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant font-light mt-0.5">
                        Active Client Portal endpoint: <code className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] select-all">{SUPABASE_URL}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-sans text-xs">
                    <span className="text-[#717971]">Database Status:</span>
                    {supabaseChecking ? (
                      <span className="flex items-center gap-1 text-primary">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                      </span>
                    ) : supabaseConnected ? (
                      <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border border-green-200">
                        ● Online
                      </span>
                    ) : (
                      <button 
                        onClick={handleVerifySupabase}
                        className="flex items-center gap-1.5 text-error bg-error/5 hover:bg-error/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border border-error/20"
                      >
                        ● Configure Tables
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Deploy relational sync operations mapping existing Clothes Catalogs, Customer Messages, and Nairobi Showroom Orders directly to high-capacity PostgreSQL instances on Supabase.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSyncAllToSupabase}
                        disabled={supabaseSyncing}
                        className="bg-primary hover:bg-secondary text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {supabaseSyncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Syncing Relational Tables...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Deploy Global Database Sync</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleVerifySupabase}
                        disabled={supabaseChecking}
                        className="border border-[#717971]/20 hover:bg-surface-container text-primary font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all cursor-pointer"
                      >
                        Test Connection
                      </button>
                    </div>

                    {supabaseSyncStatus && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs p-3.5 rounded-xl space-y-1">
                        <p className="font-sans font-semibold">Transmission Log:</p>
                        <p className="font-sans text-on-surface-variant leading-relaxed text-[11px] font-light">
                          {supabaseSyncStatus}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-surface-container p-4 rounded-xl border border-surface-container-high space-y-2 text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans flex items-center justify-between">
                      <span>PostgreSQL DB Schema Blueprint</span>
                      <span className="text-[9px] font-mono font-medium text-purple-700 lowercase bg-purple-50 px-1 rounded">run inside SQL editor</span>
                    </p>
                    <pre className="font-mono text-[10px] bg-white p-3 rounded-lg border border-surface-container overflow-x-auto text-primary whitespace-pre max-h-36 shadow-inner select-all leading-relaxed">
{`-- Create Products Table
create table products (
  id text primary key,
  title text,
  description text,
  price numeric,
  category text,
  image text,
  is_new boolean,
  on_sale boolean,
  original_price numeric
);

-- Create Messages Table
create table messages (
  id text primary key,
  name text,
  phone text,
  interest text,
  message text,
  date text,
  is_read boolean
);

-- Create Orders Table
create table orders (
  id text primary key,
  customer_name text,
  customer_phone text,
  total_amount numeric,
  status text,
  delivery_location text,
  payment_method text,
  date text,
  items text
);`}
                    </pre>
                  </div>
                </div>
              </div>

              {googleUser && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                  {/* Left Column: Calendar Scheduling */}
                  <div className="bg-white rounded-2xl border border-surface-container-high p-6 shadow-xs space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-surface-container">
                      <CalendarIcon className="w-5 h-5 text-secondary" />
                      <h3 className="font-serif text-lg font-semibold text-primary">Google Calendar Timelines</h3>
                    </div>

                    <form onSubmit={handleBookCalendarEvent} className="space-y-4">
                      {calError && (
                        <div className="bg-error/5 text-error text-xs p-3 rounded-xl flex items-center gap-2 border border-error/20">
                          <AlertCircle className="w-4 h-4" />
                          <span>{calError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Event Name / Summary</label>
                          <input
                            type="text"
                            required
                            value={calSummary}
                            onChange={(e) => setCalSummary(e.target.value)}
                            className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-11 px-4"
                          />
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Details / Description</label>
                          <textarea
                            rows={2}
                            required
                            value={calDescription}
                            onChange={(e) => setCalDescription(e.target.value)}
                            className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary px-4"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Starts At</label>
                            <input
                              type="datetime-local"
                              required
                              value={calStartDate}
                              onChange={(e) => setCalStartDate(e.target.value)}
                              className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-11 px-4"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Ends At</label>
                            <input
                              type="datetime-local"
                              required
                              value={calEndDate}
                              onChange={(e) => setCalEndDate(e.target.value)}
                              className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-11 px-4"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={calCreating}
                        className="w-full bg-primary hover:bg-secondary text-white font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 h-11"
                      >
                        {calCreating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding reservation...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Schedule Appointment</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Timeline view of actual Google calendar items */}
                    <div className="space-y-3 pt-4 border-t border-surface-container">
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Live Shop Schedules</p>
                        <button 
                          onClick={loadWorkspaceSync} 
                          type="button"
                          className="p-1 hover:bg-surface-container-high rounded shrink-0 cursor-pointer"
                          title="Refresh Calendar"
                        >
                          <RefreshCw className={`w-3 h-3 text-primary ${calendarLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>

                      {calendarLoading && calendarEvents.length === 0 ? (
                        <p className="text-xs text-outline font-sans py-4">Downloading live agendas...</p>
                      ) : calendarEvents.length === 0 ? (
                        <p className="text-xs text-[#717971] font-sans py-4 font-light text-center">No active calendar bookings scheduled.</p>
                      ) : (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {calendarEvents.map((ev, i) => (
                            <div key={i} className="bg-surface-container p-3 rounded-xl border border-surface-container-high space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-xs text-primary truncate max-w-[12rem]">{ev.summary}</span>
                                <span className="text-[9px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-mono font-bold">
                                  {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleDateString("en", {month: "short", day: "numeric"}) : "All day"}
                                </span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant line-clamp-1 font-light">{ev.description || "No info provided."}</p>
                              <p className="text-[9px] text-[#717971] text-right text-muted">
                                {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString("en", {hour: "2-digit", minute:"2-digit"}) : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Drive Catalog Packing & Gmail Client Outreach */}
                  <div className="space-y-8">
                    {/* Drive Backups Panel */}
                    <div className="bg-white rounded-2xl border border-surface-container-high p-6 shadow-xs space-y-6">
                      <div className="flex items-center gap-2 pb-4 border-b border-surface-container font-medium text-primary">
                        <Cloud className="w-5 h-5 text-secondary" />
                        <h3 className="font-serif text-lg font-semibold">Google Drive Cloud Vault</h3>
                      </div>

                      <div className="space-y-3">
                        <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
                          Backup your physical assets such as the active clothes inventory ledger or showroom checks directly as cloud assets.
                        </p>

                        {backupMessage && (
                          <div className="bg-primary/5 text-primary text-xs p-3 rounded-xl flex items-center gap-2 border border-primary/20">
                            <Check className="w-4 h-4" />
                            <span>{backupMessage}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={handleBackupCatalogToDrive}
                            disabled={driveLoading}
                            className="bg-secondary-container/20 hover:bg-secondary-container text-secondary font-sans text-xs font-bold uppercase tracking-wider py-4 rounded-xl shadow-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-secondary/15 h-24"
                          >
                            <FileText className="w-5 h-5" />
                            <span>Backup Clothes Catalog</span>
                          </button>

                          <button
                            onClick={handleBackupOrdersToDrive}
                            disabled={driveLoading}
                            className="bg-secondary-container/20 hover:bg-secondary-container text-secondary font-sans text-xs font-bold uppercase tracking-wider py-4 rounded-xl shadow-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-secondary/15 h-24"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span>Backup Orders History</span>
                          </button>
                        </div>
                      </div>

                      {/* Drive file list */}
                      <div className="space-y-3 pt-4 border-t border-surface-container">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Recent Drive Archives</p>
                        
                        {driveLoading && driveBackups.length === 0 ? (
                          <p className="text-xs text-outline font-sans">Connecting Drive index...</p>
                        ) : driveBackups.length === 0 ? (
                          <p className="text-xs text-[#717971] text-sans font-light text-center py-2">No backups cataloged inside Susan's Google Drive Account yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-36 overflow-y-auto">
                            {driveBackups.map((bk, i) => (
                              <div key={i} className="flex items-center gap-3 bg-surface-container p-2.5 rounded-xl border border-surface-container-high text-xs">
                                <FileText className="w-4 h-4 text-[#717971] shrink-0" />
                                <span className="font-sans font-medium text-primary select-none truncate flex-grow text-left">{bk.name}</span>
                                <span className="text-[9px] text-[#717971] shrink-0">Txt Document</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gmail Custom Messaging Outreach */}
                    <div className="bg-white rounded-2xl border border-surface-container-high p-6 shadow-xs space-y-6">
                      <div className="flex items-center gap-2 pb-4 border-b border-surface-container font-medium text-primary">
                        <Send className="w-5 h-5 text-secondary" />
                        <h3 className="font-serif text-lg font-semibold">Gmail Smart Outreach</h3>
                      </div>

                      <form onSubmit={handleSendGmailOutreach} className="space-y-4 text-left">
                        {gmailStatus && (
                          <div className={`text-xs p-3 rounded-xl flex items-center gap-2 border ${
                            gmailStatus.startsWith("Error") 
                              ? "bg-error/5 text-error border-error/20" 
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {gmailStatus.startsWith("Error") ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            <span>{gmailStatus === "SENT" ? "Fulfillment Email Sent Successfully!" : gmailStatus}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Select Template</label>
                              <select
                                value={gmailTemplate}
                                onChange={(e) => setGmailTemplate(e.target.value)}
                                className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none"
                              >
                                <option value="consultation">Fittings Welcomer</option>
                                <option value="receipt">Sales Confirmation Receipt</option>
                                <option value="newsletter">Boutique Fall Newsletter</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-[#717971] font-sans">Recipient Email</label>
                              <input
                                type="email"
                                required
                                value={gmailRecipient}
                                onChange={(e) => setGmailRecipient(e.target.value)}
                                className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">Email Subject Line</label>
                            <input
                              type="text"
                              required
                              value={gmailSubject}
                              onChange={(e) => setGmailSubject(e.target.value)}
                              className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface focus:outline-none h-11 px-4"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">HTML Content Markup Body</label>
                            <textarea
                              rows={4}
                              required
                              value={gmailContent}
                              onChange={(e) => setGmailContent(e.target.value)}
                              className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 font-sans text-xs text-on-surface font-mono focus:outline-none px-4"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={gmailSending}
                          className="w-full bg-primary hover:bg-secondary text-white font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 h-11"
                        >
                          {gmailSending ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching envelope...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Outreach Email</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
