import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useNavigate } from 'react-router-dom';
import { Star, Filter, ArrowUpDown, ShoppingBag, Search } from 'lucide-react';
import { useCart } from './CartContext';
import { useFirebase } from './FirebaseContext';
import { collection, query, orderBy, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const categories = ["All", "Bundles", "Trousers", "Tops", "T-shirts", "Skirts", "Shoes", "Dresses", "Gowns", "Wedding Gowns", "Graduation Gowns"];
const sizes = ["All", "S", "M", "L", "XL"];
const sizeWeights: Record<string, number> = { "S": 1, "M": 2, "L": 3, "XL": 4 };

const CollectionPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSize, setActiveSize] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const itemsToSeed = [
          { name: "Classic Blazer", category: "Blazers", price: 40, size: "M", stock: 10, imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80" },
          { name: "Formal Shoes", category: "Shoes", price: 25, size: "L", stock: 15, imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80" },
          { name: "Elegant Dress", category: "Dresses", price: 30, size: "S", stock: 8, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" },
          { name: "Tailored Trouser", category: "Trousers", price: 60, size: "M", stock: 12, imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80" },
          { name: "Basic T-shirt", category: "T-shirts", price: 20, size: "L", stock: 25, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
          { name: "Full Outfit Package", category: "Bundles", price: 125, size: "All", stock: 5, imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80" },
          { name: "Premium Wedding Gown", category: "Wedding Gowns", price: 500, size: "M", stock: 3, imageUrl: "https://images.unsplash.com/photo-1594552072238-18546115fb57?w=800&q=80" },
          { name: "Graduation Gown", category: "Graduation Gowns", price: 70, size: "L", stock: 20, imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" },
          { name: "Navy Blue Blazer", category: "Blazers", price: 45, size: "L", stock: 8, imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" },
          { name: "Leather Loafers", category: "Shoes", price: 35, size: "M", stock: 10, imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80" },
          { name: "Summer Floral Dress", category: "Dresses", price: 35, size: "M", stock: 12, imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80" },
          { name: "Slim Fit Chinos", category: "Trousers", price: 50, size: "S", stock: 15, imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80" },
          { name: "Graphic Print T-shirt", category: "T-shirts", price: 25, size: "M", stock: 20, imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80" },
          { name: "Business Casual Bundle", category: "Bundles", price: 110, size: "All", stock: 6, imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80" },
          { name: "Lace Wedding Gown", category: "Wedding Gowns", price: 600, size: "S", stock: 2, imageUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80" },
          { name: "Master's Graduation Gown", category: "Graduation Gowns", price: 85, size: "XL", stock: 15, imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" }
        ];
        for (const item of itemsToSeed) {
          await addDoc(collection(db, 'inventory'), item);
        }
      } else {
        setInventoryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSize, sortOrder, searchQuery]);

  const handleAddToCart = async (item: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(item);
  };

  const filteredAndSortedItems = useMemo(() => {
    let items = [...inventoryItems].filter(item => item.category !== 'Blazers');

    if (activeCategory !== "All") {
      items = items.filter(item => item.category === activeCategory);
    }

    if (activeSize !== "All") {
      items = items.filter(item => item.size === activeSize);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }

    if (sortOrder === "price-asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "size-asc") {
      items.sort((a, b) => (sizeWeights[a.size] || 0) - (sizeWeights[b.size] || 0));
    } else if (sortOrder === "size-desc") {
      items.sort((a, b) => (sizeWeights[b.size] || 0) - (sizeWeights[a.size] || 0));
    }

    return items;
  }, [inventoryItems, activeCategory, activeSize, sortOrder, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen font-sans bg-[#FDFCFB]">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botswana-blue/10 text-botswana-blue text-xs font-bold uppercase tracking-wider mb-6">
              <Star size={14} fill="currentColor" />
              <span>Our Collection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tighter mb-6 uppercase">
              Curated for <br/><span className="font-serif italic font-normal text-botswana-blue lowercase">Success.</span>
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              Focusing on neutral colors (black, white, beige), common sizes, and basic styles to ensure you always look your best.
            </p>
          </motion.div>
        </section>

        {/* Search Bar */}
        <section className="max-w-3xl mx-auto px-6 mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-botswana-blue transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search for blazers, gowns, shoes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border border-black/5 shadow-sm outline-none focus:ring-4 focus:ring-botswana-blue/10 transition-all text-lg font-medium"
            />
          </div>
        </section>

        {/* Filters & Sorting */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
            
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter size={18} className="text-black/40 mr-2 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category 
                      ? "bg-black text-white" 
                      : "bg-black/5 text-black/60 hover:bg-black/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Size Filter & Sorting */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
              <select
                value={activeSize}
                onChange={(e) => setActiveSize(e.target.value)}
                className="bg-black/5 border-none text-sm font-medium text-black/80 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-botswana-blue/50 cursor-pointer appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size === "All" ? "All Sizes" : `Size: ${size}`}</option>
                ))}
              </select>

              <ArrowUpDown size={18} className="text-black/40 ml-2 hidden sm:block" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-black/5 border-none text-sm font-medium text-black/80 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-botswana-blue/50 cursor-pointer appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-asc">Size: S to XL</option>
                <option value="size-desc">Size: XL to S</option>
              </select>
            </div>
          </div>
        </section>

        {/* Inventory Grid */}
        <section className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/5] bg-black/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : paginatedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {paginatedItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4 bg-black/5">
                      <img 
                        src={item.image || item.imageUrl || `https://placehold.co/400x500/e2e8f0/1e293b?text=${encodeURIComponent(item.name)}`} 
                        alt={item.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                        <p className="text-black/60 text-sm mb-1">Size: {item.size || 'N/A'}</p>
                        <p className="text-botswana-blue font-bold">P{item.price}</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock <= 0}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                          item.stock <= 0 
                            ? 'bg-black/5 text-black/20 cursor-not-allowed' 
                            : 'bg-black/5 hover:bg-botswana-blue hover:text-white'
                        }`}
                      >
                        <ShoppingBag size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full bg-black/5 text-black/60 font-medium hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                          currentPage === i + 1
                            ? 'bg-botswana-blue text-white'
                            : 'bg-transparent text-black/60 hover:bg-black/5'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full bg-black/5 text-black/60 font-medium hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <p className="text-black/40 text-lg">No items found in this category.</p>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CollectionPage;
