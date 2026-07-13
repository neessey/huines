import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ShoppingBag, Radio } from 'lucide-react';
import { motion } from 'motion/react';

export default function RoleSelector() {
  const { role, switchRole, orders } = useApp();

  // Active cooking and pending courier orders count to display in staff bubble
  const pendingCount = orders.filter(o => o.status !== 'delivered').length;

  return (
    <div id="role-selector-container" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="glass border border-white/25 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-3 px-4 md:px-6 bg-white/90 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 hidden sm:flex">
          <div className="relative">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-gray-500 font-bold tracking-wider uppercase flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-500" />
            Temps Réel
          </span>
        </div>

        <div className="flex items-center justify-around flex-1 gap-2">
          {/* CLIENT PORTAL */}
          <button
            id="role-selector-customer"
            onClick={() => switchRole('customer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              role === 'customer'
                ? 'bg-bros-black text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Espace Client</span>
          </button>

          {/* STAFF MANAGEMENT */}
          <button
            id="role-selector-management"
            onClick={() => switchRole('management')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold relative transition-all duration-300 cursor-pointer ${
              role === 'management'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Espace Professionnel</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white ring-2 ring-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
