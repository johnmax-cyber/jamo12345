import { supabase } from "./supabase";
import { Product, ContactMessage, Order } from "./types";

// 1. Connection check on startup
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("products").select("count").limit(1);
    if (error) {
      console.warn("Could not reach Supabase for connection check:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase unreachable:", err);
    return false;
  }
}

// 2. Fetch Products
export async function queryProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }
  return (data || []).map((p: any) => ({
    id: String(p.id),
    name: p.name || "",
    description: p.description || "",
    price: Number(p.price || 0),
    category: p.category as "clothes" | "books",
    image: p.image || undefined,
    isNew: p.is_new ?? false,
    onSale: p.on_sale ?? (p.discount_price ? true : false),
    originalPrice: p.original_price ? Number(p.original_price) : (p.discount_price ? Number(p.price) : undefined),
  }));
}

// 3. Save Product
export async function createProduct(product: Product): Promise<void> {
  let numericId: number | undefined = undefined;
  if (product.id) {
    const digits = product.id.replace(/\D/g, "");
    if (digits) {
      numericId = parseInt(digits, 10);
    }
  }
  if (!numericId || isNaN(numericId)) {
    numericId = Math.floor(Math.random() * 100000);
  }

  const { error } = await supabase.from("products").upsert({
    id: numericId,
    name: product.name,
    description: product.description,
    price: product.price,
    discount_price: product.originalPrice ? product.price : null,
    category: product.category,
    in_stock: true,
    whatsapp_message: `Hello Susan's Company, I am interested in ${product.name}`
  });
  if (error) {
    console.error("Error creating product in Supabase:", error);
    throw error;
  }
}

// 4. Delete Product
export async function removeProduct(id: string): Promise<void> {
  const digits = id.replace(/\D/g, "");
  const numericId = digits ? parseInt(digits, 10) : null;
  if (numericId === null || isNaN(numericId)) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("products").delete().eq("id", numericId);
  if (error) throw error;
}

// 5. Fetch Orders
export async function queryOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error querying orders:", error);
    throw error;
  }
  return (data || []).map((o: any) => ({
    id: String(o.id),
    customerName: o.customer_name || "Guest Check",
    customerPhone: o.customer_phone || "",
    totalAmount: Number(o.total_amount || 0),
    status: o.status as "pending" | "completed" | "cancelled",
    deliveryLocation: o.delivery_location || "Nairobi",
    paymentMethod: o.payment_method || "M-Pesa",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleDateString(),
    items: [
      {
        product: {
          id: String(o.product_id || "1"),
          name: o.product_name || "Modest Fashion Item",
          price: Number(o.total_amount || 0),
          category: "clothes",
          description: "Curated modest styling.",
        },
        quantity: 1,
      }
    ]
  }));
}

// 6. Save Order
export async function createOrder(order: Order): Promise<void> {
  const orderIdNum = parseInt(order.id.replace(/\D/g, "")) || Math.floor(1000 + Math.random() * 9000);
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  let pId = 1;
  if (firstItem) {
    pId = parseInt(firstItem.product.id.replace(/\D/g, "")) || 1;
  }
  const pName = firstItem ? firstItem.product.name : "Modest Item";

  const { error } = await supabase.from("orders").insert({
    id: orderIdNum,
    product_id: pId,
    product_name: pName,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    delivery_location: order.deliveryLocation,
    payment_method: order.paymentMethod,
    total_amount: order.totalAmount,
    status: order.status,
  });
  if (error) {
    console.error("Error creating order in Supabase:", error);
    throw error;
  }
}

// 7. Complete / Cancel Order Status
export async function updateOrderStatus(id: string, status: "pending" | "completed" | "cancelled"): Promise<void> {
  const digits = id.replace(/\D/g, "");
  const numericId = digits ? parseInt(digits, 10) : null;
  const targetId = (numericId !== null && !isNaN(numericId)) ? numericId : id;
  const { error } = await supabase.from("orders").update({ status }).eq("id", targetId);
  if (error) {
    console.error("Error updating order status in Supabase:", error);
    throw error;
  }
}

// 8. Fetch Messages
export async function queryMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error querying messages:", error);
    throw error;
  }
  return (data || []).map((m: any) => ({
    id: String(m.id),
    name: m.name || "",
    phone: m.phone || "",
    interest: m.interest || "",
    message: m.message || "",
    date: m.created_at ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleDateString(),
    isRead: m.is_read ?? false,
  }));
}

// 9. Save Message
export async function submitContactMessage(msg: ContactMessage): Promise<void> {
  const numericId = parseInt(msg.id.replace(/\D/g, "")) || Math.floor(Math.random() * 100000);
  const { error } = await supabase.from("messages").insert({
    id: numericId,
    name: msg.name,
    phone: msg.phone,
    interest: msg.interest,
    message: msg.message,
    is_read: msg.isRead,
  });
  if (error) {
    console.error("Error inserting message inside Supabase:", error);
    throw error;
  }
}

// 10. Update Message status
export async function markMessageReadStatus(id: string, isRead: boolean): Promise<void> {
  const digits = id.replace(/\D/g, "");
  const numericId = digits ? parseInt(digits, 10) : null;
  const targetId = (numericId !== null && !isNaN(numericId)) ? numericId : id;
  const { error } = await supabase.from("messages").update({ is_read: isRead }).eq("id", targetId);
  if (error) {
    console.error("Error updating message read status:", error);
    throw error;
  }
}

// 11. Delete Message
export async function purgeMessage(id: string): Promise<void> {
  const digits = id.replace(/\D/g, "");
  const numericId = digits ? parseInt(digits, 10) : null;
  const targetId = (numericId !== null && !isNaN(numericId)) ? numericId : id;
  const { error } = await supabase.from("messages").delete().eq("id", targetId);
  if (error) {
    console.error("Error deleting message from Supabase:", error);
    throw error;
  }
}
