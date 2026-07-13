import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, ShoppingBag, Percent, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  onClose: () => void;
  onCheckoutTrigger: () => void;
}

export default function CartDrawer({ onClose, onCheckoutTrigger }: CartDrawerProps) {
  const { cart, updateCartQuantity, removeFromCart, activePromo, applyPromo, removePromo, triggerSound } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);

  const subtotal = cart.reduce((acc, curr) => acc + (curr.finalPrice * curr.quantity), 0);
  const discountAmount = activePromo ? Math.round(subtotal * (activePromo.discountPercent / 100)) : 0;
  const total = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(false);
    if (!promoInput.trim()) return;
    
    const success = applyPromo(promoInput);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError(true);
      triggerSound('click');
    }
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      {/* Outer click closure */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <ShoppingBag className="w-5 h-5 text-bros-red" />
            <h3 className="font-display font-extrabold text-lg text-bros-black">Votre Commande</h3>
          </div>
          <button 
            id="cart-drawer-close"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bros-gray hover:bg-gray-200 flex items-center justify-center text-bros-black cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.length > 0 ? (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 bg-bros-gray/40 p-4 rounded-2xl border border-gray-100/50 text-left relative"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Detail */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display font-bold text-xs text-bros-black leading-tight">
                        {item.product.name}
                      </h4>
                      
                      {/* Customized description details */}
                      {item.customization && (
                        <p className="text-[9px] text-bros-text font-medium mt-1 leading-snug">
                          Pâte: {item.customization.pate} • Taille: {item.customization.taille}
                          {item.customization.fromages && item.customization.fromages.length > 0 && ` • Fromages: ${item.customization.fromages.join(', ')}`}
                          {item.customization.supplements && item.customization.supplements.length > 0 && ` • Suppléments: ${item.customization.supplements.join(', ')}`}
                          {item.customization.accompagnements && item.customization.accompagnements.length > 0 && ` • Sauces: ${item.customization.accompagnements.join(', ')}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-bros-black w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total price */}
                      <span className="font-mono font-bold text-xs text-bros-black">
                        {(item.finalPrice * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Delete Row button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-bros-red cursor-pointer p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <span className="text-4xl">🍕</span>
                <h4 className="font-display font-bold text-sm text-bros-black mt-4">Votre panier est vide</h4>
                <p className="text-xs text-bros-text mt-1 max-w-xs leading-relaxed">
                  Ajoutez de succulentes pizzas cuites au feu de bois, accompagnements ou boissons fraîches pour commander.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-bros-black hover:bg-bros-red text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Retourner au menu
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER SUMMARY & PROMO BAR */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4 bg-bros-gray/30">
            {/* Promo Code section */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Code PROMO (ex: BROS15)" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-bros-red/30 transition-all ${
                    promoError ? 'border-bros-red focus:border-bros-red' : 'border-gray-200'
                  }`}
                />
                <Percent className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-bros-black text-white rounded-xl text-xs font-semibold hover:bg-bros-red transition-all cursor-pointer"
              >
                Appliquer
              </button>
            </form>

            {promoError && (
              <p className="text-[10px] text-bros-red text-left font-semibold">
                Code invalide. Essayez BROS15 (15%) ou ABIDJAN20 (20%)
              </p>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-bros-text">
                <span>Sous-total</span>
                <span className="font-mono">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {/* Promo code success pill */}
              {activePromo && (
                <div className="flex justify-between text-emerald-600 font-semibold items-center">
                  <span className="flex items-center gap-1">
                    🏷️ Code {activePromo.code} ({activePromo.discountPercent}%)
                    <button type="button" onClick={removePromo} className="text-bros-red text-[10px] font-bold underline ml-1 cursor-pointer">Supprimer</button>
                  </span>
                  <span className="font-mono">-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="flex justify-between text-bros-text">
                <span>Retrait en restaurant</span>
                <span className="font-mono text-emerald-600 font-bold">Gratuit (Charge client)</span>
              </div>

              <div className="flex justify-between font-display font-extrabold text-base text-bros-black border-t border-gray-100 pt-3">
                <span>Total</span>
                <span className="font-mono">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Action buttons checkout */}
            <button
              id="cart-checkout-btn"
              onClick={onCheckoutTrigger}
              className="w-full flex items-center justify-center gap-2 bg-bros-red hover:bg-bros-red/90 text-white font-semibold text-sm py-4 px-6 rounded-2xl shadow-xl shadow-bros-red/20 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>Passer la commande</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
