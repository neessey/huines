import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Product, Order } from './types';

// Modals & Panels
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Storytelling from './components/Storytelling';
import MenuSection from './components/MenuSection';
import CustomizerModal from './components/CustomizerModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracking from './components/OrderTracking';

// Unified Role Portal
import RoleSelector from './components/RoleSelector';
import ManagementDashboard from './components/ManagementDashboard';

// Lucide Icons
import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { role, triggerSound } = useApp();

  // Customer UI states
  const [activeCustomizerProduct, setActiveCustomizerProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const handleOrderPlaced = (placedOrder: Order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTrackingOrder(placedOrder);
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-white text-bros-black relative pb-28">
      
      {/* RENDER ACTIVE SPACE PORTAL */}
      <AnimatePresence mode="wait">
        {role === 'customer' ? (
          <motion.div
            key="customer-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Header */}
            <Navbar 
              onCartToggle={() => setIsCartOpen(!isCartOpen)} 
              onTrackingToggle={() => {
                if (activeTrackingOrder) {
                  setActiveTrackingOrder(activeTrackingOrder);
                }
              }}
              hasActiveOrder={activeTrackingOrder !== null}
            />

            {/* If tracking is active, let them display that full screen instead of landing */}
            {activeTrackingOrder ? (
              <div className="bg-bros-gray/20 min-h-[80vh] flex items-center justify-center py-12">
                <OrderTracking 
                  order={activeTrackingOrder} 
                  onClose={() => setActiveTrackingOrder(null)} 
                />
              </div>
            ) : (
              <>
                {/* Hero section */}
                <Hero />

                {/* Storytelling block */}
                <Storytelling />

                {/* Products Menu Section */}
                <MenuSection onOpenCustomizer={(p) => setActiveCustomizerProduct(p)} />

              

               
              </>
            )}

            {/* FOOTER */}
            <footer id="footer-section" className="bg-bros-black text-white border-t border-white/5 py-16 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
                {/* Brand description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-base">
                                <img src="/assets/logo.jpeg" alt="Huinest Food" className="w-11 h-11 rounded-xl shadow-lg shadow-bros-red/20 object-cover" />

                    </div>
                    <span className="font-display font-extrabold text-base tracking-tight text-white uppercase">
                      Huinest<span className="text-amber-500">food</span>
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Tout le monde mérite une Pizza. Ingrédients nobles importés, fermentation artisanale de la pâte pendant 48 heures et retrait rapide  à Abidjan.
                  </p>
                </div>

                {/* Fast Links */}
                <div className="space-y-4">
                  <h5 className="font-display font-bold text-xs uppercase tracking-wider text-amber-500">Découvrir</h5>
                  <ul className="space-y-2.5 text-gray-400 font-semibold">
                    <li><a href="#hero-section" className="hover:text-white">La carte des Pizzas</a></li>
                    <li><a href="#story-section" className="hover:text-white">A propos</a></li>
                  </ul>
                </div>

                {/* Contact information */}
                <div className="space-y-4">
                  <h5 className="font-display font-bold text-xs uppercase tracking-wider text-amber-500">Contacts & Support</h5>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center gap-2"><MapPin className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" /> Abidjan, Côte d'Ivoire</li>
                    <li className="flex items-center gap-2"><Phone className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" /> +225 07 88 47 49 42</li>
                    <li className="flex items-center gap-2"><Mail className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" /> contact@huinestfood.ci</li>
                  </ul>
                </div>

                {/* Services */}
                <div className="space-y-4 text-left">
                  <h5 className="font-display font-bold text-xs uppercase tracking-wider text-amber-500">Horaires de Service</h5>
                  <p className="text-gray-400 leading-relaxed font-semibold">
                    Retraits à Abidjan 7j/7 de 11h00 à 23h45.<br/>
                    Support client 100% à l'écoute.
                  </p>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-4">
                <span>© 2026 Huinestfood Experience. Tous droits réservés.</span>
                <span className="flex items-center gap-1.5 font-mono text-gray-400">
                  Plateforme Gourmande • Côte d'Ivoire 🇨🇮
                </span>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="management-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen bg-bros-gray/20"
          >
            <ManagementDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM MODALS & DRAWER RENDER ON TRIGGERS */}
      <AnimatePresence>
        {activeCustomizerProduct && (
          <CustomizerModal 
            product={activeCustomizerProduct} 
            onClose={() => setActiveCustomizerProduct(null)} 
          />
        )}

        {isCartOpen && (
          <CartDrawer 
            onClose={() => setIsCartOpen(false)} 
            onCheckoutTrigger={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }} 
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal 
            onClose={() => setIsCheckoutOpen(false)} 
            onOrderPlaced={handleOrderPlaced} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
