import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onCartToggle: () => void;
  onTrackingToggle: () => void;
  hasActiveOrder: boolean;
}

export default function Navbar({ onCartToggle, onTrackingToggle, hasActiveOrder }: NavbarProps) {
  const { cart, triggerSound } = useApp();
  
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleLinkClick = (id: string) => {
    triggerSound('click');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full transition-all duration-300 glass border-b border-gray-100 premium-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div id="navbar-logo" className="flex items-center gap-3 cursor-pointer" onClick={() => handleLinkClick('hero-section')}>
          <img src="/assets/logo.jpeg" alt="Huinest Food" className="w-11 h-11 rounded-xl shadow-lg shadow-bros-red/20 object-cover" />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-tight leading-none text-yellow-800">
              HUINESTFOOD
            </span>
            <span className="font-mono text-[9px] tracking-wider font-semibold text-black uppercase">
              Abidjan Experience
            </span>
          </div>
        </div>

        {/* CENTER MENU */}
        <nav id="navbar-links" className="hidden lg:flex items-center gap-8 text-sm font-semibold text-bros-black/80">
          <button onClick={() => handleLinkClick('menu-section')} className="hover:text-bros-red cursor-pointer transition-colors duration-200">Menu</button>
          <button onClick={() => handleLinkClick('footer-section')} className="hover:text-bros-red cursor-pointer transition-colors duration-200">Contact</button>
        </nav>

        {/* RIGHT SIDEBAR ACTIONS */}
        <div id="navbar-actions" className="flex items-center gap-3 md:gap-5">
          {/* Active order quick link */}
          {hasActiveOrder && (
            <motion.button
              id="navbar-tracking-btn"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => {
                triggerSound('click');
                onTrackingToggle();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-xs font-semibold hover:bg-emerald-100 transition-all cursor-pointer animate-pulse"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Suivi live</span>
            </motion.button>
          )}

         

          {/* Cart Icon Drawer Trigger */}
          <button 
            id="navbar-cart-btn"
            onClick={() => {
              triggerSound('click');
              onCartToggle();
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-bros-black hover:bg-bros-black/90 text-white shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-bros-red rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
}
