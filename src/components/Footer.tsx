import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

export const Footer = () => {
  return (
    <footer className="bg-[#FDFCFB] pt-20 pb-10 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Logo className="w-10 h-10 text-black" />
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-tighter leading-none uppercase">fashionFIT</span>
                <span className="font-display font-bold text-[10px] tracking-[0.2em] text-botswana-blue uppercase">Botswana</span>
              </div>
            </div>
            <p className="text-black/60 max-w-sm mb-8">
              Nna le Styl. Spend Less. Empowering students across UB, BIUST, Botho and beyond.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-botswana-blue hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-botswana-blue hover:text-white transition-all"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-botswana-blue hover:text-white transition-all"><Facebook size={18} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-black/60">
              <li><Link to="/services" className="hover:text-black">Services</Link></li>
              <li><Link to="/collection" className="hover:text-black">Collection</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-black">How it Works</Link></li>
              <li><a href="#" className="hover:text-black">Student Discounts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-black/60">
              <li>BSBS Main Campus</li>
              <li>rent@fashionfit.edu</li>
              <li>267 76979789</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-black/40">
          <p>© 2026 fashionFIT Botswana. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
