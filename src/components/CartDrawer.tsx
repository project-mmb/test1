import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../CartContext';
import { useFirebase } from '../FirebaseContext';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const PolicyModal = ({ isOpen, onAccept, onDecline }: { isOpen: boolean, onAccept: () => void, onDecline: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            <h3 className="text-2xl font-display font-bold mb-4">Rental Return Policy</h3>
            <div className="text-sm text-black/60 space-y-3 mb-8">
              <p>Items must be returned within 3 days of your event. Please ensure items are returned in the same condition as received.</p>
              <p>Late returns incur a fee of P20 per day. We handle all professional cleaning—no need to wash before returning!</p>
            </div>
            <div className="flex gap-4">
              <button onClick={onDecline} className="flex-1 py-3 rounded-full font-bold border border-black/10 hover:bg-black/5 transition-colors">Decline</button>
              <button onClick={onAccept} className="flex-1 py-3 rounded-full font-bold bg-botswana-blue text-white hover:bg-botswana-blue/90 transition-colors">Accept</button>
            </div>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { user, login } = useFirebase();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      login();
      return;
    }

    if (cart.length === 0) return;

    setIsCheckingOut(true);
    const transactionIds: string[] = [];

    try {
      // Process each item in the cart
      for (const item of cart) {
        const transactionData = {
          userId: user.uid,
          itemId: item.id ? item.id.toString() : '',
          itemName: item.name,
          size: item.size || null,
          duration: item.duration || null,
          type: 'purchase',
          status: 'pending',
          amount: item.price * item.quantity,
          quantity: item.quantity,
          timestamp: serverTimestamp()
        };

        // Add to global transactions
        const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
        transactionIds.push(transactionRef.id);
        
        // Add to user history
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', user.uid, 'history', transactionRef.id), transactionData);
      }

      setPendingTransactions(transactionIds);
      setShowPolicyModal(true);
      // Do not use clearCart() here as it restores stock
      // We will clear the cart locally in CartContext if needed, or just let the checkout process handle it
      setIsCartOpen(false);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong during checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleAcceptPolicy = () => {
    setShowPolicyModal(false);
    alert('Success! Your order has been placed.');
    navigate('/profile');
  };

  const handleDeclinePolicy = async () => {
    if (!user) return;
    // Cancel the order
    for (const transactionId of pendingTransactions) {
      await deleteDoc(doc(db, 'transactions', transactionId));
      await deleteDoc(doc(db, 'users', user.uid, 'history', transactionId));
    }
    setShowPolicyModal(false);
    alert('Order cancelled as the policy was declined.');
    setIsCheckingOut(false);
  };

  return (
    <>
      <PolicyModal isOpen={showPolicyModal} onAccept={handleAcceptPolicy} onDecline={handleDeclinePolicy} />
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-black/5">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <ShoppingBag size={24} /> Your Cart
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black/40">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-black/5 hover:border-botswana-blue/20 transition-all shadow-sm">
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm leading-tight pr-4">{item.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-black/30 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.size && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/5 text-black/60 rounded-full">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.duration && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-botswana-blue/10 text-botswana-blue rounded-full">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-black/5 rounded-full p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="font-bold text-botswana-blue text-lg">P{item.price * item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-black/5 bg-black/5">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-black/60">Total</span>
                    <span className="text-2xl font-display font-bold">P{cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isCheckingOut ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Checkout'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
