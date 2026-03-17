import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X,
  LogOut,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { useCart } from '../CartContext';
import { Link, useLocation } from 'react-router-dom';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path 
        d="M20 70 L50 30 L80 70" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="50" cy="20" r="8" fill="currentColor" />
      <path 
        d="M35 85 L65 85" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <circle cx="50" cy="55" r="4" className="fill-botswana-blue" />
    </svg>
  </div>
);

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, login, logout, loading } = useFirebase();
  const { cart, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';

  const isSpecificAdmin = user?.email === "johansonsebudi@gmail.com";

  let navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Collection', href: '/collection' },
    { name: 'How it Works', href: isHomePage ? '#how-it-works' : '/#how-it-works' },
  ];

  const isAdmin = profile?.role === 'admin' || isSpecificAdmin;

  if (isSpecificAdmin) {
    navLinks = [{ name: 'Admin', href: '/admin' }];
  } else if (isAdmin) {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHomePage ? 'py-4 glass shadow-sm' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <Logo className="w-12 h-12 text-black group-hover:rotate-12 transition-transform duration-300" />
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter leading-none uppercase">fashionFIT</span>
            <span className="font-display font-bold text-xs tracking-[0.2em] text-botswana-blue uppercase">Botswana</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="text-sm font-medium hover:text-black/60 transition-colors">
              {link.name}
            </Link>
          ))}
          
          {!isSpecificAdmin && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-botswana-blue text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              {!isSpecificAdmin ? (
                <Link to="/profile" className="flex items-center gap-2 group">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName || ''} className="w-8 h-8 rounded-full border border-black/10 group-hover:border-botswana-blue transition-colors" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-botswana-blue/10 flex items-center justify-center text-botswana-blue group-hover:bg-botswana-blue group-hover:text-white transition-all">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="text-sm font-bold group-hover:text-botswana-blue transition-colors">{profile?.displayName?.split(' ')[0]}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-botswana-blue text-white flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-sm font-bold">Admin</span>
                </div>
              )}
              <button 
                onClick={() => logout()}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-black/80 transition-all"
            >
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          {!isSpecificAdmin && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-botswana-blue text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[60] p-8 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-display font-bold">
                  {link.name}
                </Link>
              ))}
              
              {user && !isSpecificAdmin && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-display font-bold text-botswana-blue">Profile</Link>
              )}

              {!loading && !user && (
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-8 px-8 py-4 bg-botswana-blue text-white rounded-full text-lg font-medium text-center"
                >
                  Login
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="mt-8 px-8 py-4 border border-black/10 rounded-full text-lg font-medium flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
