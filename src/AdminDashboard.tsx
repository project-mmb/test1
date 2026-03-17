import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  ArrowLeft,
  Package,
  Activity,
  DollarSign,
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle as XCircleIcon 
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useFirebase } from './FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onBack: () => void;
}

const COLORS = ['#00A3E0', '#000000', '#F27D26', '#8E9299'];

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user, profile, loading: authLoading, logout } = useFirebase();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Blazers',
    price: 0,
    size: 'M',
    stock: 0,
    imageUrl: ''
  });
  const navigate = useNavigate();

  const isSpecificAdmin = user?.email === "johansonsebudi@gmail.com";

  useEffect(() => {
    const isAdmin = profile?.role === 'admin' || isSpecificAdmin;
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate, isSpecificAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const isAdmin = profile?.role === 'admin' || user?.email === "johansonsebudi@gmail.com";
    if (!user || !isAdmin) return;
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubTransactions();
      unsubInventory();
      unsubUsers();
    };
  }, []);

  // Calculate Metrics
  const totalSales = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const pendingOrders = transactions
    .filter(t => t.status === 'pending').length;

  const popularItems = inventory
    .map(item => ({
      name: item.name,
      count: transactions.filter(t => t.itemId === item.id).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const salesByStatus = [
    { name: 'Completed', value: transactions.filter(t => t.status === 'completed').length },
    { name: 'Pending', value: transactions.filter(t => t.status === 'pending').length },
  ];

  const handleSeedDatabase = async () => {
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

    try {
      for (const item of itemsToSeed) {
        await addDoc(collection(db, 'inventory'), item);
      }
      alert("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database: ", error);
      alert("Failed to seed database.");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), newItem);
        setEditingItem(null);
      } else {
        await addDoc(collection(db, 'inventory'), newItem);
      }
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Blazers', price: 0, size: 'M', stock: 0, imageUrl: '' });
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      price: item.price,
      size: item.size,
      stock: item.stock,
      imageUrl: item.imageUrl
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleUpdateTransactionStatus = async (transaction: any, status: string) => {
    try {
      await updateDoc(doc(db, 'transactions', transaction.id), { status });
      // Also update in user history
      if (transaction.userId) {
        await updateDoc(doc(db, 'users', transaction.userId, 'history', transaction.id), { status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-botswana-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            {!isSpecificAdmin ? (
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black mb-4 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Store
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 mb-4 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
            <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Admin Dashboard</h1>
            <p className="text-black/60">Real-time overview of fashionFIT Botswana</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-botswana-blue text-white rounded-2xl font-bold hover:bg-botswana-blue/80 transition-all shadow-lg shadow-botswana-blue/20"
            >
              <Plus size={20} /> Add Item
            </button>
            {!isSpecificAdmin && (
              <button
                onClick={handleSeedDatabase}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors"
              >
                Seed Database
              </button>
            )}
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-black/5">
              <div className="w-10 h-10 bg-botswana-blue/10 rounded-xl flex items-center justify-center text-botswana-blue">
                <Activity size={20} />
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">System Status</p>
                <p className="text-sm font-bold">Operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={<DollarSign size={24} />} 
            label="Total Revenue" 
            value={`P${totalSales.toLocaleString()}`} 
            trend="+12% vs last month"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            icon={<Clock size={24} />} 
            label="Pending Orders" 
            value={pendingOrders.toString()} 
            trend="Needs attention"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard 
            icon={<Users size={24} />} 
            label="Total Users" 
            value={users.length.toString()} 
            trend={`${users.filter(u => u.role === 'admin').length} admins`}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard 
            icon={<Package size={24} />} 
            label="Inventory Items" 
            value={inventory.length.toString()} 
            trend={`${inventory.filter(i => i.stock < 3).length} low stock`}
            color="bg-orange-50 text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Popular Items</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularItems}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#00A3E0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Transaction Mix</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByStatus}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {salesByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-xs font-bold text-black/60">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden mb-12">
          <div className="p-8 border-b border-black/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <button className="text-sm font-bold text-botswana-blue hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] text-[10px] font-bold uppercase tracking-widest text-black/40">
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Item</th>
                  <th className="px-8 py-4">Details</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Actions</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-8 py-4 text-sm font-medium">{t.userId.substring(0, 8)}...</td>
                    <td className="px-8 py-4 text-sm font-bold">{t.itemName}</td>
                    <td className="px-8 py-4 text-xs text-black/60">
                      {t.size && <span className="block">Size: {t.size}</span>}
                      {t.duration && <span className="block text-botswana-blue">{t.duration}</span>}
                    </td>
                    <td className="px-8 py-4 text-sm font-bold">P{t.amount}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        t.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                        t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-2">
                        {t.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateTransactionStatus(t, 'completed')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Complete Order"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateTransactionStatus(t, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <XCircleIcon size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs text-black/40">
                      {t.timestamp?.toDate().toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-black/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">Inventory Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] text-[10px] font-bold uppercase tracking-widest text-black/40">
                  <th className="px-8 py-4">Item</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Size</th>
                  <th className="px-8 py-4">Stock</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-sm font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-black/60">{item.category}</td>
                    <td className="px-8 py-4 text-sm font-bold">P{item.price}</td>
                    <td className="px-8 py-4 text-sm">{item.size}</td>
                    <td className="px-8 py-4">
                      <span className={`text-sm font-bold ${item.stock < 5 ? 'text-red-500' : 'text-black'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 text-botswana-blue hover:bg-botswana-blue/5 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <XCircleIcon size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                    >
                      {['Blazers', 'Shoes', 'Dresses', 'Trousers', 'T-shirts', 'Bundles', 'Wedding Gowns', 'Graduation Gowns'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Size</label>
                    <select 
                      value={newItem.size}
                      onChange={e => setNewItem({...newItem, size: e.target.value})}
                      className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                    >
                      {['S', 'M', 'L', 'XL', 'All'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Price (P)</label>
                    <input 
                      required
                      type="number" 
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={newItem.stock}
                      onChange={e => setNewItem({...newItem, stock: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Image URL</label>
                  <input 
                    required
                    type="url" 
                    value={newItem.imageUrl}
                    onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-black/5 rounded-xl outline-none focus:ring-2 focus:ring-botswana-blue/50"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-botswana-blue text-white rounded-xl font-bold mt-4 hover:bg-botswana-blue/80 transition-all"
                >
                  {editingItem ? 'Update Item' : 'Add to Inventory'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-display font-bold mb-2">{value}</h4>
      <p className="text-xs text-emerald-600 font-medium">{trend}</p>
    </div>
  );
}
