import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, Product } from '../types';
import { Clock, Flame, Award, Heart, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  onOpenCustomizer: (product: Product) => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'Pizzas Classiques', label: 'Pizza' },
  { id: 'Accompagnements', label: 'Accompagnement'},
  { id: 'Boissons', label: 'Boissons' },
];

export default function MenuSection({ onOpenCustomizer }: MenuSectionProps) {
  const { products, addToCart, triggerSound } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Pizzas Classiques');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductAdd = (product: Product) => {
    if (product.category.startsWith('Pizzas')) {
      // Open Customizer for pizzas
      triggerSound('click');
      onOpenCustomizer(product);
    } else {
      // Direct add to cart for sides, drinks, desserts
      addToCart(product, 1);
    }
  };

  return (
    <section id="menu-section" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITLE */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">LA CARTE HUINESTFOOD</span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-bros-black mt-3">
            Découvrez notre menu.
          </h2>
          <p className="text-bros-text text-sm md:text-base mt-4">
            Chaque pizza est étirée à la main et préparée à la commande sous vos yeux. Suivez l'avancement de votre commande en direct de la cuisine jusqu'à son retrait au comptoir.
          </p>

          {/* Search bar inside menu */}
          <div className="mt-8 w-full max-w-md relative">
            <input 
              type="text" 
              placeholder="Rechercher une pizza, un accompagnement, une boisson..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bros-gray border border-gray-100 rounded-2xl px-6 py-3.5 pr-12 text-sm outline-none focus:bg-white focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* TWO COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT SIDEBAR - CATEGORIES */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 flex overflow-x-auto lg:flex-col gap-2.5 pb-4 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                id={`menu-cat-${cat.id}`}
                onClick={() => {
                  triggerSound('click');
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl font-display font-bold text-sm text-left whitespace-nowrap cursor-pointer transition-all duration-300 w-full ${
                  selectedCategory === cat.id
                    ? 'bg-bros-black text-white shadow-xl shadow-black/5 scale-[1.02]'
                    : 'bg-bros-gray hover:bg-gray-200/70 text-gray-700'
                }`}
              >
                <span>{cat.label}</span>
                
                {selectedCategory === cat.id && (
                  <motion.div 
                    layoutId="activeCategoryDot" 
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* RIGHT PRODUCTS LIST */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      id={`product-card-${product.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
                    >
                      {/* Popular Tag Badge */}
                      {product.popular && (
                        <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Flame className="w-3 h-3 fill-white" />
                          <span>Populaire</span>
                        </div>
                      )}

                      {/* Image section with Zoom Hover effect */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-bros-gray mb-5 flex items-center justify-center">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {/* Prep time badge */}
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-bold text-bros-black font-mono flex items-center gap-1 border border-white/20 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{product.prepTime} min</span>
                        </div>
                      </div>

                      {/* Product copy text info */}
                      <div className="text-left flex-grow">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-display font-extrabold text-lg text-bros-black group-hover:text-amber-500 transition-colors duration-200">
                            {product.name}
                          </h3>
                          <span className="font-mono font-extrabold text-base text-bros-black whitespace-nowrap">
                            {product.price.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                          </span>
                        </div>

                        <p className="text-xs text-bros-text line-clamp-2 mt-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Ingredients small bullets */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {product.ingredients.slice(0, 3).map((ing, i) => (
                            <span key={i} className="text-[10px] bg-bros-gray text-gray-500 font-semibold px-2 py-0.5 rounded-lg">
                              {ing}
                            </span>
                          ))}
                          {product.ingredients.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-semibold px-1.5 py-0.5">
                              +{product.ingredients.length - 3} plus
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Call to action add button bottom */}
                      <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-between">
                        {product.calories && (
                          <span className="font-mono text-[10px] text-gray-400 font-medium">
                            {product.calories} kcal
                          </span>
                        )}
                        <button
                          id={`add-to-cart-btn-${product.id}`}
                          onClick={() => handleProductAdd(product)}
                          className="ml-auto flex items-center gap-1.5 bg-bros-black text-white hover:bg-amber-500 font-semibold text-xs py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-black/5 hover:shadow-amber-500/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{product.category.startsWith('Pizzas') ? 'Personnaliser' : 'Ajouter'}</span>
                        </button>
                      </div>

                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-20 text-center bg-bros-gray/30 rounded-3xl border border-dashed border-gray-200">
                  <span className="text-3xl">🍕</span>
                  <h3 className="font-display font-bold text-sm text-bros-black mt-3">Aucun produit trouvé</h3>
                  <p className="text-xs text-bros-text mt-1">Essayez un autre mot clé de recherche.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
