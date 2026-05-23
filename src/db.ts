import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDocFromServer
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { Product, ContactMessage, Order } from "./types";
import { INITIAL_PRODUCTS, INITIAL_MESSAGES, INITIAL_ORDERS } from "./data";
import {
  queryProductsFromSupabase,
  syncProductToSupabase,
  deleteProductFromSupabase,
  queryMessagesFromSupabase,
  syncMessageToSupabase,
  updateMessageReadStatusInSupabase,
  deleteMessageFromSupabase,
  queryOrdersFromSupabase,
  syncOrderToSupabase,
  updateOrderStatusInSupabase,
  testSupabaseConnection
} from "./supabase";

// 1. Connection check on startup
export async function testFirestoreConnection() {
  const testPath = "test/connection";
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration: client is offline.");
    }
  }
  
  // Also check Supabase
  try {
    const isSupaUp = await testSupabaseConnection();
    console.log("Supabase system validation checks:", isSupaUp ? "ON" : "OFF");
  } catch (e) {
    console.warn("Supabase ping failure:", e);
  }
}

// 2. Fetch Products
export async function queryProducts(): Promise<Product[]> {
  // First try Supabase as requested
  try {
    const supabaseProducts = await queryProductsFromSupabase();
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log("Using primary database (Supabase) for Products catalog.");
      return supabaseProducts;
    }
  } catch (err) {
    console.warn("Could not query Products from Supabase (tables may not be created yet). Falling back to Firestore:", err);
  }

  // Fallback to Firestore
  const collectionName = "products";
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Product);
    });

    // Bootstrap if completely empty in Firestore
    if (items.length === 0) {
      console.log("Products DB empty. Bootstrapping default items...");
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, collectionName, p.id), p);
        items.push(p);
        
        // Also seed Supabase in background if connected
        syncProductToSupabase(p).catch(e => console.warn("Background auto-sync default product to Supabase failed:", e));
      }
    }
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return INITIAL_PRODUCTS;
  }
}

// 3. Save Product
export async function createProduct(product: Product): Promise<void> {
  // 1. Save to Supabase
  try {
    const res = await syncProductToSupabase(product);
    if (!res.success) {
      console.warn("Supabase writing notification:", res.error);
    }
  } catch (err) {
    console.error("Failed writing product to Supabase:", err);
  }

  // 2. Save to Firestore
  const collectionName = "products";
  try {
    await setDoc(doc(db, collectionName, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${product.id}`);
  }
}

// 4. Delete Product
export async function removeProduct(productId: string): Promise<void> {
  // 1. Delete from Supabase
  try {
    await deleteProductFromSupabase(productId);
  } catch (err) {
    console.error("Failed to delete product from Supabase:", err);
  }

  // 2. Delete from Firestore
  const collectionName = "products";
  try {
    await deleteDoc(doc(db, collectionName, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${productId}`);
  }
}

// 5. Fetch Messages
export async function queryMessages(): Promise<ContactMessage[]> {
  // First try Supabase
  try {
    const supabaseMsgs = await queryMessagesFromSupabase();
    if (supabaseMsgs && supabaseMsgs.length > 0) {
      console.log("Using primary database (Supabase) for Contact messages.");
      return supabaseMsgs;
    }
  } catch (err) {
    console.warn("Could not query Messages from Supabase. Falling back to Firestore:", err);
  }

  // Fallback to Firestore (ONLY if user is authenticated/admin to avoid permission errors)
  const currentUser = auth.currentUser;
  const isUserAdmin = currentUser && (
    currentUser.email === "johnmax4354@gmail.com" ||
    currentUser.email === "staff@susanscompany.com"
  );

  if (!isUserAdmin) {
    console.log("User is not authenticated as admin in Firebase. Skipping Firestore messages query and returning fallback list.");
    return INITIAL_MESSAGES;
  }

  const collectionName = "messages";
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const messages: ContactMessage[] = [];
    querySnapshot.forEach((docSnap) => {
      messages.push(docSnap.data() as ContactMessage);
    });

    // Bootstrap if empty
    if (messages.length === 0) {
      for (const m of INITIAL_MESSAGES) {
        await setDoc(doc(db, collectionName, m.id), m);
        messages.push(m);
        
        // Background sync to Supabase
        syncMessageToSupabase(m).catch(e => console.warn("Background auto-sync default message to Supabase failed:", e));
      }
    }
    return messages;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return INITIAL_MESSAGES;
  }
}

// 6. Save Message
export async function submitContactMessage(msg: ContactMessage): Promise<void> {
  // 1. Save to Supabase
  try {
    await syncMessageToSupabase(msg);
  } catch (err) {
    console.error("Failed writing message to Supabase:", err);
  }

  // 2. Save to Firestore
  const collectionName = "messages";
  try {
    await setDoc(doc(db, collectionName, msg.id), msg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${msg.id}`);
  }
}

// 7. Update Message status
export async function markMessageReadStatus(messageId: string, isRead: boolean): Promise<void> {
  // 1. Update Supabase
  try {
    await updateMessageReadStatusInSupabase(messageId, isRead);
  } catch (err) {
    console.error("Failed to update message read status in Supabase:", err);
  }

  // 2. Update Firestore
  const collectionName = "messages";
  try {
    const docRef = doc(db, collectionName, messageId);
    await updateDoc(docRef, { isRead });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${messageId}`);
  }
}

// 8. Delete Message
export async function purgeMessage(messageId: string): Promise<void> {
  // 1. Delete from Supabase
  try {
    await deleteMessageFromSupabase(messageId);
  } catch (err) {
    console.error("Failed to delete message from Supabase:", err);
  }

  // 2. Delete from Firestore
  const collectionName = "messages";
  try {
    await deleteDoc(doc(db, collectionName, messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${messageId}`);
  }
}

// 9. Fetch Orders
export async function queryOrders(): Promise<Order[]> {
  // First try Supabase
  try {
    const supabaseOrders = await queryOrdersFromSupabase();
    if (supabaseOrders && supabaseOrders.length > 0) {
      console.log("Using primary database (Supabase) for Customer orders.");
      return supabaseOrders;
    }
  } catch (err) {
    console.warn("Could not query Orders from Supabase. Falling back to Firestore:", err);
  }

  // Fallback to Firestore (ONLY if user is authenticated/admin to avoid permission errors)
  const currentUser = auth.currentUser;
  const isUserAdmin = currentUser && (
    currentUser.email === "johnmax4354@gmail.com" ||
    currentUser.email === "staff@susanscompany.com"
  );

  if (!isUserAdmin) {
    console.log("User is not authenticated as admin in Firebase. Skipping Firestore orders query and returning fallback list.");
    return INITIAL_ORDERS;
  }

  const collectionName = "orders";
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const orders: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });

    // Bootstrap if empty
    if (orders.length === 0) {
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, collectionName, ord.id), ord);
        orders.push(ord);
        
        // Background sync to Supabase
        syncOrderToSupabase(ord).catch(e => console.warn("Background auto-sync default order to Supabase failed:", e));
      }
    }
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return INITIAL_ORDERS;
  }
}

// 10. Save Order
export async function createOrder(order: Order): Promise<void> {
  // 1. Save to Supabase
  try {
    await syncOrderToSupabase(order);
  } catch (err) {
    console.error("Failed writing order to Supabase:", err);
  }

  // 2. Save to Firestore
  const collectionName = "orders";
  try {
    await setDoc(doc(db, collectionName, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${order.id}`);
  }
}

// 11. Complete / Cancel Order Status
export async function updateOrderStatus(orderId: string, status: "pending" | "completed" | "cancelled"): Promise<void> {
  // 1. Update Supabase
  try {
    await updateOrderStatusInSupabase(orderId, status);
  } catch (err) {
    console.error("Failed to update status in Supabase:", err);
  }

  // 2. Update Firestore
  const collectionName = "orders";
  try {
    const docRef = doc(db, collectionName, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${orderId}`);
  }
}
