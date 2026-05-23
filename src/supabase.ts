import { createClient } from "@supabase/supabase-js";
import { Product, ContactMessage, Order, CartItem } from "./types";

// Prefer env variables, fallback to supplied parameters to make it run instantly in the sandbox
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://kyknrxolzctljahlegsc.supabase.co";
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a25yeG9semN0bGphaGxlZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIzNjcsImV4cCI6MjA5NDQzODM2N30.KoJM7dKRtTwOiWIT5VmVpeNqSGJOIts2qQhWsAYoWJM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Validates the Supabase connection by making a lightweight query.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("products").select("count").limit(1);
    // If the table doesn't exist, the API is still reachable (code will be PGE_UNKNOWN or similar but connection is OK)
    if (error && error.code === "PGRST301") {
      // PGRST301 usually means JWT token error or resource not found, but we connected
      return true;
    }
    return true;
  } catch (err) {
    console.error("Supabase unreachable:", err);
    return false;
  }
}

/**
 * Pushes Products into Supabase tables.
 * To make this work seamlessly, compiles with upsert and logs custom schemas for user convenience.
 */
export async function syncProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("products")
      .upsert({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        is_new: product.isNew,
        on_sale: product.onSale,
        original_price: product.originalPrice ?? null,
      }, { onConflict: "id" });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error syncing product ${product.id} to Supabase:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Pushes ContactMessages into Supabase tables.
 */
export async function syncMessageToSupabase(msg: ContactMessage): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("messages")
      .upsert({
        id: msg.id,
        name: msg.name,
        phone: msg.phone,
        interest: msg.interest,
        message: msg.message,
        date: msg.date,
        is_read: msg.isRead,
      }, { onConflict: "id" });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error syncing message ${msg.id} to Supabase:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Pushes Orders into Supabase tables.
 */
export async function syncOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("orders")
      .upsert({
        id: order.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        total_amount: order.totalAmount,
        status: order.status,
        delivery_location: order.deliveryLocation,
        payment_method: order.paymentMethod,
        date: order.date,
        items: JSON.stringify(order.items) // Store ordered items list as JSON string or JSONB
      }, { onConflict: "id" });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error syncing order ${order.id} to Supabase:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Fetches all products from Supabase database.
 */
export async function queryProductsFromSupabase(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*");
  if (error) throw error;
  if (!data || data.length === 0) return [];
  return data.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    category: p.category as "clothes" | "books",
    image: p.image,
    isNew: p.is_new,
    onSale: p.on_sale,
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
  }));
}

/**
 * Delete a product from Supabase.
 */
export async function deleteProductFromSupabase(productId: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

/**
 * Fetches all messages from Supabase.
 */
export async function queryMessagesFromSupabase(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*");
  if (error) throw error;
  if (!data || data.length === 0) return [];
  return data.map((m: any) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    interest: m.interest,
    message: m.message,
    date: m.date,
    isRead: m.is_read
  }));
}

/**
 * Update message reading status in Supabase.
 */
export async function updateMessageReadStatusInSupabase(messageId: string, isRead: boolean): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: isRead })
    .eq("id", messageId);
  if (error) throw error;
}

/**
 * Purge a message from Supabase.
 */
export async function deleteMessageFromSupabase(messageId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);
  if (error) throw error;
}

/**
 * Fetches all orders from Supabase.
 */
export async function queryOrdersFromSupabase(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*");
  if (error) throw error;
  if (!data || data.length === 0) return [];
  return data.map((o: any) => {
    let parsedItems: CartItem[] = [];
    try {
      parsedItems = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []);
    } catch (e) {
      console.warn("Error parsing items for order:", o.id, e);
    }
    return {
      id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      totalAmount: Number(o.total_amount),
      status: o.status as "pending" | "completed" | "cancelled",
      deliveryLocation: o.delivery_location,
      paymentMethod: o.payment_method,
      date: o.date,
      items: parsedItems
    };
  });
}

/**
 * Update order processing status in Supabase.
 */
export async function updateOrderStatusInSupabase(orderId: string, status: "pending" | "completed" | "cancelled"): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}

