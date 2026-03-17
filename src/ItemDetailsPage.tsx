import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Clock, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useCart } from './CartContext';
import { useFirebase } from './FirebaseContext';

const ItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useFirebase();

  // Redirect specific admin
  useEffect(() => {
    if (!authLoading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!id) throw new Error('Item ID is required');
      const docRef = doc(db, 'inventory', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Item not found');
      return { id: docSnap.id, ...docSnap.data() } as any;
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (item) {
      await addToCart(item);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-12 h-12 border-4 border-botswana-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <h2 className="text-3xl font-display font-bold mb-4 uppercase">Item Not Found</h2>
        <p className="text-black/60 mb-8">The item you are looking for does not exist or has been removed.</p>
        <Link to="/collection" className="px-8 py-4 bg-black text-white rounded-full font-bold">
          Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/collection" className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl bg-white">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  {item.category}
                </span>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-botswana-blue fill-botswana-blue" />
                  ))}
                  <span className="text-xs font-bold text-black/40 ml-2 uppercase tracking-widest">4.9 (24 Reviews)</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-4 leading-none">
                  {item.name}
                </h1>
                <p className="text-3xl font-display font-bold text-botswana-blue">P{item.price}</p>
              </div>

              <div className="space-y-8 mb-10">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Description</h3>
                  <p className="text-black/60 leading-relaxed">
                    {item.description || `Premium ${item.category.toLowerCase()} designed for style and comfort. Perfect for graduations, professional events, and special occasions in Botswana. This piece features high-quality fabric and a tailored fit that ensures you look your best.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Size</h3>
                    <div className="w-12 h-12 rounded-xl border-2 border-botswana-blue flex items-center justify-center font-bold text-botswana-blue bg-botswana-blue/5">
                      {item.size}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Availability</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-black/60">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleAddToCart}
                  disabled={item.stock <= 0}
                  className="flex-1 px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button className="px-10 py-5 border border-black/10 rounded-full font-bold text-lg hover:bg-black/5 transition-all">
                  Wishlist
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-botswana-blue/10 flex items-center justify-center text-botswana-blue">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Verified Quality</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Clock size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Fast Rental</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Clean & Ready</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section Placeholder */}
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-display font-bold uppercase tracking-tight">Customer Reviews</h2>
              <button className="text-sm font-bold text-botswana-blue underline">Write a Review</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center font-bold">
                      {i === 1 ? 'KM' : 'OT'}
                    </div>
                    <div>
                      <p className="font-bold">{i === 1 ? 'Kabo M.' : 'Onneile T.'}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="text-botswana-blue fill-botswana-blue" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-black/60 italic leading-relaxed">
                    "{i === 1 ? 'The quality of the graduation gown was exceptional. It fit perfectly and made my day even more special. Highly recommend fashionFIT!' : 'Great service and very professional. The internship bundle helped me feel confident for my interview. Will definitely use again.'}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItemDetailsPage;
