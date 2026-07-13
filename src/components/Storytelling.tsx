import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Leaf } from 'lucide-react';

export default function Storytelling() {
  return (
    <section id="story-section" className="py-24 bg-bros-gray/50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT LARGE IMAGE */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-500/10 rounded-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500/5 rounded-3xl -z-10"></div>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
              <img 
                src="/assets/img1.jpg" 
                alt="Huinestfood Pizza Crafting" 
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay card */}
              {/* Overlay card */}
<div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/20 max-w-xs text-left">
  <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
    Depuis votre commande
  </span>
  <p className="font-display font-bold text-sm text-bros-black">
    "Votre pizza est préparée à la commande pour garantir fraîcheur, saveur et qualité jusqu'à la première bouchée."
  </p>
</div>
            </div>
          </div>

          {/* RIGHT STORY CONTENT */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">NOTRE PASSION</span>
            
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-bros-black leading-tight tracking-tight mt-3">
              Une pâte d'exception. <br/>
              <span className="text-amber-500">Un goût inoubliable.</span>
            </h2>

           <p className="font-display font-bold text-sm text-bros-black">
  "Des ingrédients frais, une pâte légère et un savoir-faire artisanal pour une pizza qui fait toute la différence."
</p>
            
           <p className="text-bros-text text-sm md:text-base leading-relaxed mt-4">
  Chaque pizza est préparée avec une pâte fraîche, une sauce tomate maison, de la mozzarella fondante et des ingrédients rigoureusement sélectionnés. Notre équipe veille à chaque détail afin de vous offrir une pizza savoureuse, généreuse et toujours préparée à la commande.
</p>

            {/* Core Values list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-amber-500 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                 <h4 className="font-display font-bold text-sm text-bros-black">
  Ingrédients Frais
</h4>

<p className="text-xs text-bros-text mt-1">
  Des produits sélectionnés avec soin pour garantir fraîcheur et qualité à chaque pizza.
</p>
 </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                 <h4 className="font-display font-bold text-sm text-bros-black">
  Préparation Minute
</h4>

<p className="text-xs text-bros-text mt-1">
  Chaque commande est préparée au moment de votre achat afin de préserver toutes les saveurs.
</p>
    </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-bros-black">
  Emballage Responsable
</h4>

<p className="text-xs text-bros-text mt-1">
  Des emballages conçus pour préserver la chaleur de votre pizza tout en limitant notre impact sur l'environnement.
</p>
 </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
