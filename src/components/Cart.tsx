import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trash2, ArrowLeft, CheckCircle2, Calendar, MapPin, Phone } from 'lucide-react';
import { useCart } from '../CartContext';
import { useFirebase } from '../FirebaseContext';

export const Cart = () => {
  const { cart, removeFromCart, checkoutCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const { user, login } = useFirebase();
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [rentalPeriod, setRentalPeriod] = useState({ start: '', end: '' });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const calculateDuration = () => {
    if (!rentalPeriod.start || !rentalPeriod.end) return 0;
    const start = new Date(rentalPeriod.start);
    const end = new Date(rentalPeriod.end);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = calculateDuration();

  // Reset step when cart closes
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => setCheckoutStep('cart'), 300);
    }
  }, [isCartOpen]);

  const handleProceedToDetails = () => {
    if (!user) {
      login();
      return;
    }
    setCheckoutStep('details');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;

    setIsProcessing(true);
    try {
      await checkoutCart({
        deliveryAddress,
        phoneNumber,
        rentalPeriod: rentalPeriod.start && rentalPeriod.end ? rentalPeriod : null
      });
      setCheckoutStep('success');
    } catch (error) {
      console.error('Transaction error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {checkoutStep === 'details' ? (
                  <button onClick={() => setCheckoutStep('cart')} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-black" />
                  </button>
                ) : (
                  <ShoppingBag size={24} className="text-botswana-blue" />
                )}
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
                  {checkoutStep === 'cart' ? 'Your Cart' : checkoutStep === 'details' ? 'Checkout Details' : 'Order Confirmed'}
                </h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'cart' && (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black/40">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-black/5 p-4 rounded-2xl">
                        <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image || item.imageUrl || `https://placehold.co/400x500/e2e8f0/1e293b?text=${encodeURIComponent(item.name)}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold leading-tight mb-1">{item.name}</h4>
                            <p className="text-xs text-black/60 uppercase tracking-wider font-bold">
                              {item.category || 'Item'} {item.size ? `• Size: ${item.size}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-botswana-blue">P{item.price}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold">Qty: {item.quantity}</span>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {checkoutStep === 'details' && (
                <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-black/5 pb-2">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                        <Phone size={16} /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +267 71 234 567"
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                        <MapPin size={16} /> Delivery Address / Campus Location
                      </label>
                      <textarea 
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your full address or campus room number"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <h3 className="font-bold text-lg">Rental Period (Optional)</h3>
                      {duration > 0 && (
                        <span className="bg-botswana-blue/10 text-botswana-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {duration} {duration === 1 ? 'Day' : 'Days'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/60">If your order includes rental items, please specify the dates.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                          <Calendar size={16} /> From
                        </label>
                        <input 
                          type="date" 
                          value={rentalPeriod.start}
                          min={today}
                          onChange={(e) => setRentalPeriod({ ...rentalPeriod, start: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                          <Calendar size={16} /> To
                        </label>
                        <input 
                          type="date" 
                          value={rentalPeriod.end}
                          onChange={(e) => setRentalPeriod({ ...rentalPeriod, end: e.target.value })}
                          min={rentalPeriod.start || today}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <CheckCircle2 size={80} className="text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Order Placed!</h3>
                  <p className="text-black/60">
                    Thank you for your order. We'll be in touch shortly to confirm delivery details.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 px-8 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-display font-bold text-botswana-blue">P{cartTotal}</span>
                </div>
                <button 
                  onClick={handleProceedToDetails}
                  className="w-full py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}

            {checkoutStep === 'details' && (
              <div className="p-6 border-t border-black/5 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold">Total to Pay</span>
                  <span className="text-2xl font-display font-bold text-botswana-blue">P{cartTotal}</span>
                </div>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full py-4 bg-botswana-blue text-white rounded-full font-bold uppercase tracking-widest hover:bg-botswana-blue/90 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
