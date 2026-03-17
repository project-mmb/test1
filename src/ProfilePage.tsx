import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  History, 
  ShoppingBag, 
  Clock, 
  Mail, 
  Calendar,
  Shield,
  ArrowLeft,
  XCircle
} from 'lucide-react';
import { useFirebase } from './FirebaseContext';
import { collection, query, orderBy, doc, updateDoc, increment, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, profile, loading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHistoryLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const [cancellingOrder, setCancellingOrder] = useState<any>(null);

  const handleCancelOrder = async (transaction: any) => {
    if (!user) return;
    
    try {
      // Update status in user history
      const userHistoryRef = doc(db, 'users', user.uid, 'history', transaction.id);
      await updateDoc(userHistoryRef, { status: 'cancelled' });

      // Update status in global transactions
      const globalTransactionRef = doc(db, 'transactions', transaction.id);
      await updateDoc(globalTransactionRef, { status: 'cancelled' });

      // Increment stock in inventory
      if (transaction.itemId) {
        const itemRef = doc(db, 'inventory', transaction.itemId.toString());
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          await updateDoc(itemRef, {
            stock: increment(transaction.quantity || 1)
          });
        }
      }
      
      setCancellingOrder(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-botswana-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Profile Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 sticky top-32">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-4">
                    {profile?.photoURL ? (
                      <img 
                        src={profile.photoURL} 
                        alt={profile.displayName || ''} 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-botswana-blue/10 flex items-center justify-center text-botswana-blue border-4 border-white shadow-xl">
                        <UserIcon size={48} />
                      </div>
                    )}
                    {profile?.role === 'admin' && (
                      <div className="absolute bottom-0 right-0 bg-botswana-blue text-white p-2 rounded-full shadow-lg" title="Admin">
                        <Shield size={16} />
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{profile?.displayName}</h2>
                  <p className="text-botswana-blue font-bold text-xs uppercase tracking-widest mt-1">{profile?.role || 'Student'}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-black/60">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Email Address</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-black/60">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Member Since</p>
                      <p className="text-sm font-medium">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-black/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-botswana-blue">{history.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-botswana-blue">
                        {history.filter(h => h.status === 'completed').length}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* History Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-botswana-blue/10 flex items-center justify-center text-botswana-blue">
                  <History size={24} />
                </div>
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Style History</h2>
              </div>

              {historyLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-black/5 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-black/5">
                  <ShoppingBag className="mx-auto mb-4 text-black/10" size={48} />
                  <p className="text-black/40 font-medium mb-6">You haven't made any transactions yet.</p>
                  <Link to="/#inventory" className="px-8 py-4 bg-black text-white rounded-full font-bold text-sm hover:bg-black/80 transition-all">
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[2rem] border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-all group gap-4"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-600 flex-shrink-0">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{item.itemName}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">
                              Status: <span className={`text-black/60 ${item.status === 'cancelled' ? 'text-red-500' : ''}`}>{item.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="font-display font-bold text-xl text-botswana-blue">P{item.amount}</p>
                          <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter mt-1">
                            {item.timestamp?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {item.status === 'pending' && (
                          <button 
                            onClick={() => setCancellingOrder(item)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                            title="Cancel Order"
                          >
                            <XCircle size={24} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-display font-bold mb-4">Cancel Order</h3>
            <p className="text-black/60 mb-8">
              Are you sure you want to cancel your order for <span className="font-bold text-black">{cancellingOrder.itemName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-3 rounded-full font-bold bg-black/5 hover:bg-black/10 transition-colors"
              >
                Keep Order
              </button>
              <button 
                onClick={() => handleCancelOrder(cancellingOrder)}
                className="flex-1 py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
