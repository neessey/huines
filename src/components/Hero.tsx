import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Sparkles, ChevronDown, Grid } from 'lucide-react';
import { useApp } from '../context/AppContext';

const layers = [
  { name: 'tomato', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&auto=format&fit=crop&q=80', color: 'border-red-500', offset: -40 },
  { name: 'cheese', img: 'https://images.unsplash.com/photo-1452201224648-f538f4aa4ad0?w=100&auto=format&fit=crop&q=80', color: 'border-yellow-500', offset: 0 },
  { name: 'dough', img: 'https://images.unsplash.com/photo-1571407-918f48b1fe38?w=100&auto=format&fit=crop&q=80', color: 'border-amber-700', offset: 40 },
];

export default function Hero() {
  const { triggerSound } = useApp();
  const [exploded, setExploded] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const scrollTo = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-px opacity-10 pointer-events-none">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="border border-gray-300" />
        ))}
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center text-center z-10">
        
        {/* PIZZA PRODUCT AREA */}
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-full aspect-square max-w-96 md:max-w-100 flex items-center justify-center mb-8"
        >
          <div className="absolute w-50 h-50 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      {exploded ? (
         <div className="relative w-full h-full flex flex-col items-center justify-center scale-90">
           {layers.map((layer, i) => (
             <motion.div key={i} animate={{ y: layer.offset * 0.7 }} className={`absolute p-2 rounded-xl shadow-lg border ${layer.color}`}>
               <img src={layer.img} alt={layer.name} className="w-12 h-12 object-cover rounded-lg" />
             </motion.div>
           ))}
         </div>
      ) : (
         <motion.img
           src="/assets/hero.png"
           alt="Pizza Margherita"
           className="w-full h-full object-contain drop-shadow-2xl"
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
         />
      )}
    </motion.div>

    {/* STREAMING_CHUNK:Rendering headlines and buttons... */}
    {/* TEXT CONTENT */}
    <div className="space-y-4">
      <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[0.9] text-bros-black">
        FINI LES PIZZAS<br/>
        <span className="text-amber-500">SANS SAVEUR</span>
      </h1>

      <p className="text-gray-600 text-lg font-medium px-4">
  Des ingrédients frais, une mozzarella fondante et des recettes généreuses préparées avec soin pour satisfaire toutes vos envies.
</p>
    </div>

    {/* BUTTON - Mimicking the hand-drawn style from the photo */}
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={scrollTo}
      className="mt-8 px-10 py-5 bg-amber-400 hover:bg-amber-500 text-bros-black rounded-[40px_10px_40px_10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] font-display font-black text-xl flex items-center gap-3 transition-all cursor-pointer"
    >
      Commander
      <ArrowRight className="w-5 h-5" />
    </motion.button>

  </div>
</div>
  );
}
