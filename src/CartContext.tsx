import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, increment, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useFirebase } from './FirebaseContext';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  size?: string;
  category?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (itemId: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkoutCart: (details: { deliveryAddress: string; phoneNumber: string; rentalPeriod?: { start: string; end: string } | null }) => Promise<void>;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useFirebase();

  useEffect(() => {
    if (!user) {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (item: any) => {
    // Check stock first
    if (item.id) {
      try {
        const itemRef = doc(db, 'inventory', item.id.toString());
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          const currentStock = itemSnap.data().stock || 0;
          if (currentStock <= 0) {
            console.warn('Sorry, this item is out of stock.');
            return;
          }
          // Decrement stock in Firebase
          await updateDoc(itemRef, {
            stock: increment(-1)
          });
        }
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }

    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (itemId: string | number) => {
    const itemToRemove = cart.find(i => i.id === itemId);
    if (!itemToRemove) return;

    setCart(cart.filter(i => i.id !== itemId));

    // Increment stock in Firebase
    if (itemId) {
      try {
        const itemRef = doc(db, 'inventory', itemId.toString());
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          await updateDoc(itemRef, {
            stock: increment(itemToRemove.quantity)
          });
        }
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }
  };

  const clearCart = async () => {
    // Increment stock for all items
    for (const item of cart) {
      if (item.id) {
        try {
          const itemRef = doc(db, 'inventory', item.id.toString());
          const itemSnap = await getDoc(itemRef);
          if (itemSnap.exists()) {
            await updateDoc(itemRef, {
              stock: increment(item.quantity)
            });
          }
        } catch (error) {
          console.error("Error updating stock:", error);
        }
      }
    }
    setCart([]);
  };

  const checkoutCart = async (details: { deliveryAddress: string; phoneNumber: string; rentalPeriod?: { start: string; end: string } | null }) => {
    if (!user) return;

    try {
      // Record transactions for each item
      for (const item of cart) {
        const transactionData = {
          userId: user.uid,
          itemId: item.id.toString(),
          itemName: item.name,
          type: 'purchase',
          status: 'pending',
          amount: item.price * item.quantity,
          quantity: item.quantity,
          size: item.size || null,
          deliveryAddress: details.deliveryAddress,
          phoneNumber: details.phoneNumber,
          rentalPeriod: details.rentalPeriod || null,
          timestamp: serverTimestamp()
        };

        // Add to global transactions
        let docRef;
        try {
          docRef = await addDoc(collection(db, 'transactions'), transactionData);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'transactions');
          throw error;
        }
        
        // Add to user history
        const userHistoryRef = doc(db, 'users', user.uid, 'history', docRef.id);
        const { setDoc } = await import('firebase/firestore');
        try {
          await setDoc(userHistoryRef, transactionData);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/history`);
          throw error;
        }
      }
      
      // Clear cart locally
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, checkoutCart, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
