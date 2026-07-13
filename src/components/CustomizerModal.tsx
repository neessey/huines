import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PizzaCustomization } from '../types';
import { X, Check, ShoppingBag, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomizerModalProps {
  product: Product;
  onClose: () => void;
}

const FROMAGES = ['Mozzarella extra', 'Parmesan'];
const SUPPLEMENTS = ['Pepperoni', 'Champignons', 'Olives noires', 'Poivrons', 'Oignons caramélisés', 'Jambon de dinde', 'Viande Hachée'];
const ACCOMPAGNEMENTS = ['Frites', 'Alloco'];

export default function CustomizerModal({ product, onClose }: CustomizerModalProps) {
  const { addToCart, triggerSound } = useApp();
  
  const [pate, setPate] = useState<'Classique' | 'Fine' | 'Épaisse'>('Classique');
  const [taille, setTaille] = useState<'Moyenne' | 'Grande' | 'Géante'>('Moyenne');
  const [selectedFromages, setSelectedFromages] = useState<string[]>(['Mozzarella extra']);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [selectedAccompagnements, setSelectedAccompagnements] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.price);

  // Recalculate price dynamically when options modify
  useEffect(() => {
    let price = product.price;
    
    // Crust modifier
    if (pate === 'Épaisse') price += 500;
    
    // Size modifier
    if (taille === 'Grande') price += 1500;
    if (taille === 'Géante') price += 3000;
    
    // Cheese & toppings modifiers (excluding initial mozzarella)
    const extraCheeses = selectedFromages.filter(f => f !== 'Mozzarella extra');
    price += extraCheeses.length * 500;
    price += selectedSupplements.length * 600;
    price += selectedAccompagnements.length * 800;

    setTotalPrice(price);
  }, [pate, taille, selectedFromages, selectedSupplements, selectedAccompagnements, product]);

  const toggleFromage = (f: string) => {
    triggerSound('click');
    setSelectedFromages(prev => 
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const toggleSupplement = (s: string) => {
    triggerSound('click');
    setSelectedSupplements(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const toggleAccompagnement = (a: string) => {
    triggerSound('click');
    setSelectedAccompagnements(prev => 
      prev.includes(a) ? prev.filter(item => item !== a) : [...prev, a]
    );
  };

  const handleAddToCart = () => {
    const customization: PizzaCustomization = {
      pate,
      taille,
      fromages: selectedFromages,
      supplements: selectedSupplements,
      accompagnements: selectedAccompagnements
    };
    
    // Direct cast as any to map to generic customization property in AppContext
    addToCart(product, quantity, customization as any);
    onClose();
  };

  return (
    <div id="customizer-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[32px] overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col lg:flex-row relative"
      >
        {/* CLOSE BUTTON */}
        <button 
          id="customizer-close"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-bros-gray hover:bg-gray-200 text-bros-black z-10 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* LEFT COLUMN: PRODUCT IMAGE */}
        <div className="lg:w-1/2 bg-bros-gray/40 p-4 sm:p-8 flex flex-col items-center justify-center border-r border-gray-100 min-h-[250px] sm:min-h-[320px] lg:min-h-0 overflow-hidden relative">
          {/* Product Image */}
          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain rounded-2xl"
            />
            
            {/* Size indicator overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded-full">
              {taille}
            </div>
          </div>

          {/* Product Name & Description */}
          <div className="mt-4 sm:mt-6 text-center max-w-xs">
            <span className="text-sm sm:text-base font-bold text-amber-600">{product.name}</span>
            <p className="text-[10px] sm:text-[11px] text-bros-text font-medium mt-1 leading-relaxed">
              {product.description || 'Personnalisez votre pizza avec nos ingrédients premium.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATOR INPUTS */}
        <div className="lg:w-1/2 p-4 sm:p-8 overflow-y-auto max-h-[80vh] lg:max-h-none text-left">
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-bros-black">Création d'Artiste</h3>
          <p className="text-[10px] sm:text-xs text-bros-text mt-1">Configurez votre pizza pour une expérience de dégustation royale.</p>

          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            
            {/* 1. SELECTION DE LA PATE */}
            <div>
              <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-bros-black/50 block mb-1.5 sm:mb-2.5">Choix de la pâte</span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {(['Classique', 'Fine', 'Épaisse'] as const).map(p => {
                  let costText = p === 'Épaisse' ? ' (+500 F)' : '';
                  return (
                    <button
                      key={p}
                      onClick={() => { triggerSound('click'); setPate(p); }}
                      className={`px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl border font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer ${
                        pate === p 
                          ? 'border-amber-500 bg-amber-500/5 text-amber-600 font-bold' 
                          : 'border-gray-200 hover:bg-bros-gray text-gray-700'
                      }`}
                    >
                      <span>{p}</span>
                      <span className="text-[7px] sm:text-[9px] text-gray-400 font-normal">{costText || 'Gratuit'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. TAILLE DE LA PIZZA */}
            <div>
              <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-bros-black/50 block mb-1.5 sm:mb-2.5">Taille de la Pizza</span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {(['Moyenne', 'Grande', 'Géante'] as const).map(s => {
                  let extraText = '';
                  if (s === 'Grande') extraText = ' (+1 500 F)';
                  if (s === 'Géante') extraText = ' (+3 000 F)';
                  return (
                    <button
                      key={s}
                      onClick={() => { triggerSound('click'); setTaille(s); }}
                      className={`px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl border font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer ${
                        taille === s 
                          ? 'border-amber-500 bg-amber-500/5 text-amber-600 font-bold' 
                          : 'border-gray-200 hover:bg-bros-gray text-gray-700'
                      }`}
                    >
                      <span className="text-center">{s}</span>
                      <span className="text-[7px] sm:text-[9px] text-gray-400 font-normal">{extraText || 'Inclus'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. FROMAGES (MULTI) */}
            <div>
              <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-bros-black/50 block mb-1.5 sm:mb-2.5">Extra Fromages (+500 FCFA/unité)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                {FROMAGES.map(f => {
                  const selected = selectedFromages.includes(f);
                  return (
                    <button
                      key={f}
                      onClick={() => toggleFromage(f)}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border font-semibold text-[10px] sm:text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selected 
                          ? 'border-amber-500 bg-amber-500/5 text-amber-600 font-bold' 
                          : 'border-gray-200 hover:bg-bros-gray text-gray-700'
                      }`}
                    >
                      <span className="text-left">{f}</span>
                      {selected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

             {/* 5. ACCOMPAGNEMENTS (New section replacing Sauces) */}
            <div>
              <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-bros-black/50 block mb-1.5 sm:mb-2.5">Accompagnements (+800 FCFA/unité)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                {ACCOMPAGNEMENTS.map(a => {
                  const selected = selectedAccompagnements.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAccompagnement(a)}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border font-semibold text-[10px] sm:text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selected 
                          ? 'border-amber-500 bg-amber-500/5 text-amber-600 font-bold' 
                          : 'border-gray-200 hover:bg-bros-gray text-gray-700'
                      }`}
                    >
                      <span className="text-left">{a}</span>
                      {selected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* 4. SUPPLEMENTS (Now first among toppings) */}
            <div>
              <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-bros-black/50 block mb-1.5 sm:mb-2.5">Suppléments (+600 FCFA/unité)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                {SUPPLEMENTS.map(s => {
                  const selected = selectedSupplements.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSupplement(s)}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border font-semibold text-[10px] sm:text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selected 
                          ? 'border-amber-500 bg-amber-500/5 text-amber-600 font-bold' 
                          : 'border-gray-200 hover:bg-bros-gray text-gray-700'
                      }`}
                    >
                      <span className="text-left">{s}</span>
                      {selected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

           
          </div>

          {/* BOTTOM CHECKOUT PRICE ACTION */}
          <div className="border-t border-gray-100 pt-4 sm:pt-6 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 sm:gap-3 bg-bros-gray px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl w-full sm:w-auto">
              <button 
                onClick={() => { triggerSound('click'); setQuantity(q => Math.max(1, q - 1)); }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              </button>
              <span className="font-mono font-bold text-xs sm:text-sm text-bros-black w-5 sm:w-6 text-center">{quantity}</span>
              <button 
                onClick={() => { triggerSound('click'); setQuantity(q => q + 1); }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              </button>
            </div>

            {/* Add Button */}
            <button
              id="customizer-add-to-cart"
              onClick={handleAddToCart}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ajouter — {(totalPrice * quantity).toLocaleString('fr-FR')} FCFA</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}