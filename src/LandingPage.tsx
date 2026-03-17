import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Briefcase, 
  Footprints, 
  ArrowRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X,
  Instagram,
  Twitter,
  Facebook,
  LogOut,
  User as UserIcon,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useFirebase } from './FirebaseContext';
import { useCart } from './CartContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// --- Constants & Config ---

const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
const withBase = (path: string) => `${baseUrl}${path.replace(/^\/+/, '')}`;

const IMAGE_ASSETS = {
  HERO_MAIN: withBase('assets/images/hero-main.jpg'),
  HERO_SECONDARY: withBase('assets/images/hero-secondary.jpg'),
  HOW_IT_WORKS: withBase('assets/images/how-it-works.jpg'),
};

// --- Components ---

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botswana-blue/10 text-botswana-blue text-xs font-bold uppercase tracking-wider mb-6">
            <Star size={14} fill="currentColor" />
            <span>Built for UB, BIUST, Botho & More</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-8 text-balance uppercase">
            Nna le <span className="font-serif italic font-normal text-botswana-blue lowercase">Styl.</span> <br/>Spend <span className="font-serif italic font-normal lowercase">Less.</span>
          </h1>
          <p className="text-lg text-black/60 max-w-md mb-10 leading-relaxed">
            Professional graduation gowns, presentation outfits & styling services — built for every fashionista in Botswana. Look sharp, save your Pula.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/collection" className="px-8 py-4 bg-black text-white rounded-full font-medium flex items-center gap-2 group hover:gap-4 transition-all">
              Explore Collection <ArrowRight size={20} />
            </Link>
            <Link to="/collection" className="px-8 py-4 border border-black/10 rounded-full font-medium hover:bg-black/5 transition-all">
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-2">
            <img 
              src={IMAGE_ASSETS.HERO_MAIN} 
              alt="University of Botswana student" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 aspect-square w-48 rounded-2xl overflow-hidden shadow-xl -rotate-6 border-8 border-white">
            <img 
              src={IMAGE_ASSETS.HERO_SECONDARY} 
              alt="Fashion graduation vibes in Botswana" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute top-12 -right-6 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce">
            <div className="w-10 h-10 bg-botswana-blue/10 rounded-full flex items-center justify-center text-botswana-blue">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold">Botswana Verified</p>
              <p className="text-[10px] text-black/40">Quality guaranteed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Browse", desc: "Check our online catalog or visit our fashion pop-up.", icon: <ShoppingBag size={24} /> },
    { title: "Pick & Fit", desc: "Try it on! We offer fitting sessions every Tuesday.", icon: <Star size={24} /> },
    { title: "Rock It", desc: "Wear it to your event and feel like a million bucks.", icon: <Briefcase size={24} /> },
    { title: "Return", desc: "Drop it off at the hub. We handle the cleaning.", icon: <Clock size={24} /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-display font-bold mb-8 leading-tight">Simple. Fast.<br/>Fashion Ready.</h2>
            <div className="space-y-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-botswana-blue">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                    <p className="text-white/60 text-sm max-w-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-botswana-blue/10 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src={IMAGE_ASSETS.HOW_IT_WORKS} 
              alt="Students studying at a Botswana university library" 
              className="relative rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useFirebase();

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => item.category !== 'Blazers');

  const seedData = async () => {
    const sampleItems = [
      { name: "UB Graduation Gown", category: "Gowns", price: 150, stock: 50, size: "L", imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=UB+Graduation+Gown" },
      { name: "Complete Presentation Outfit", category: "Bundles", price: 120, stock: 15, size: "M", imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Complete+Presentation+Outfit" },
      { name: "BIUST Graduation Gown", category: "Gowns", price: 150, stock: 30, size: "S", imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=BIUST+Graduation+Gown" },
      { name: "Black Midi Dress", category: "Dresses", price: 50, stock: 25, size: "M", imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Black+Midi+Dress" },
      { name: "Formal Shoes", category: "Shoes", price: 25, size: "L", stock: 15, imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Formal+Shoes" },
      { name: "Tailored Trouser", category: "Trousers", price: 60, size: "M", stock: 12, imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Tailored+Trouser" },
      { name: "Basic T-shirt", category: "T-shirts", price: 20, size: "L", stock: 25, imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Basic+T-shirt" },
      { name: "Premium Wedding Gown", category: "Wedding Gowns", price: 500, size: "M", stock: 3, imageUrl: "https://placehold.co/400x500/e2e8f0/1e293b?text=Premium+Wedding+Gown" }
    ];

    for (const item of sampleItems) {
      await addDoc(collection(db, 'inventory'), item);
    }
  };

  return (
    <section id="inventory" className="py-24 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl font-display font-bold mb-4 uppercase tracking-tight">The Collection</h2>

          </div>
          {profile?.role === 'admin' && (
            <button onClick={seedData} className="text-xs font-bold text-botswana-blue underline">Seed Sample Data</button>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-black/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-black/5">
            <ShoppingBag className="mx-auto mb-4 text-black/20" size={48} />
            <p className="text-black/40 font-medium">No items found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-white mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                <p className="text-botswana-blue font-bold">P{item.price}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default function LandingPage() {
  const { user, loading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <Hero />
        <Inventory />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
