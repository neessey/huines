import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, OrderStatus, PaymentMethod, PizzaCustomization, RestaurantMetrics, ProductCategory } from '../types';
import { PRODUCTS } from '../data/products';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { registerStaffDeviceForPush } from '../lib/messaging';

interface AppContextType {
  role: 'customer' | 'management';
  switchRole: (newRole: 'customer' | 'management') => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, customization?: PizzaCustomization) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  activePromo: { code: string; discountPercent: number } | null;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  orders: Order[];
  placeOrder: (clientName: string, phone: string, address: string, paymentMethod: PaymentMethod, notes?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignCourier: (orderId: string, courierName: string) => void;
  metrics: RestaurantMetrics;
  triggerSound: (type: 'click' | 'success' | 'bell' | 'cash' | 'pop') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Firestore refuse les valeurs `undefined` (même imbriquées, ex: un champ optionnel
// d'un produit resté `undefined` au lieu d'être omis). On nettoie avant chaque écriture.
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Web Audio API Sound Synthesizer for premium UX sound feedback
const playSynthesizedSound = (type: 'click' | 'success' | 'bell' | 'cash' | 'pop') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      case 'pop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      case 'cash': {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1500, now);
        osc1.connect(gain);
        osc1.start();
        osc1.stop(now + 0.3);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2200, now + 0.08);
        osc2.connect(gain);
        osc2.start();
        osc2.stop(now + 0.35);
        break;
      }
      case 'bell': {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.8);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1860, now);
        osc.connect(gain);
        osc.start();
        osc.stop(now + 0.8);

        const oscOvertones = ctx.createOscillator();
        oscOvertones.type = 'sine';
        oscOvertones.frequency.setValueAtTime(3720, now);
        oscOvertones.connect(gain);
        oscOvertones.start();
        oscOvertones.stop(now + 0.5);
        break;
      }
      case 'success': {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        osc.connect(gain);
        osc.start();
        osc.stop(now + 0.5);
        break;
      }
    }
  } catch (e) {
    console.warn('Audio synthesis warning: Web Audio Context blocked or unsupported', e);
  }
};

// Seeding high-fidelity pizza orders so the panel doesn't start empty
const INITIAL_ORDERS: Order[] = [
  {
    id: '101',
    items: [
      {
        id: 'init-1',
        product: PRODUCTS[0], // Margherita Authentique
        quantity: 2,
        customization: {
          pate: 'Classique',
          taille: 'Grande',
          fromages: ['Mozzarella di Bufala extra'],
          supplements: ['Basilic frais'],
          accompagnements: ['Frites']
        },
        finalPrice: 5000
      },
      {
        id: 'init-2',
        product: PRODUCTS[10], // Jus de Bissap
        quantity: 2,
        finalPrice: 1500
      }
    ],
    total: 13000,
    status: 'preparing',
    paymentMethod: 'wave',
    phone: '07 08 09 10 11',
    address: 'Abidjan, Cocody Mermoz, Villa 14',
    clientName: 'Marc-Antoine Koffi',
    notes: 'Bien dorée au four à bois s\'il vous plaît.',
    pointsEarned: 130,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    deliveryTimeEst: 15
  },
  {
    id: '102',
    items: [
      {
        id: 'init-3',
        product: PRODUCTS[7], // L'Alloco Pizza
        quantity: 1,
        finalPrice: 6900
      }
    ],
    total: 6900,
    status: 'received',
    paymentMethod: 'orange_money',
    phone: '05 55 66 77 88',
    address: 'Plateau, Boulevard de la République, Imm. Alpha',
    clientName: 'Fatoumata Diallo',
    pointsEarned: 69,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    deliveryTimeEst: 25
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Rôle par défaut : customer. Le mode "management" (console admin) n'est plus
  // accessible via un bouton visible — il se débloque uniquement via ?auth= dans l'URL,
  // même logique que pour OREA COLLECTION.
  const [role, setRole] = useState<'customer' | 'management'>('customer');
  const [products] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activePromo, setActivePromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [metrics, setMetrics] = useState<RestaurantMetrics>({
    totalRevenue: 19900,
    averagePrepTime: 10,
    orderCount: 2,
    topProducts: [
      { name: PRODUCTS[0].name, salesCount: 2, image: PRODUCTS[0].image, revenue: 9000 },
      { name: PRODUCTS[7].name, salesCount: 1, image: PRODUCTS[7].image, revenue: 6900 }
    ],
    hourlyRevenue: [
      { hour: '11:00', amount: 6900, count: 1 },
      { hour: '12:00', amount: 13000, count: 1 }
    ],
    categorySales: [
      { category: 'Pizzas Classiques', value: 9000 },
      { category: 'Pizzas Spéciales', value: 6900 },
      { category: 'Boissons', value: 3000 }
    ]
  });

  const ordersLoadedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());
  const notifiedOrdersRef = useRef<string[]>([]);

  // Accès console admin caché : présence du paramètre ?auth= dans l'URL uniquement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('auth')) {
      setRole('management');
    }
  }, []);
  useEffect(() => {
  if (role === 'management') {
    registerStaffDeviceForPush('BFi6VXzUPlrj5mtWlu6vnIoqgcJJ7nYLzax-3L_Uckrf3P9qEET3xqIMv1OuX_5SmVkowTUN1XPIv_TBLhCRRCE');
  }
}, [role]);

  // Real-time sync for orders
  useEffect(() => {
    const ordersCol = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersCol, async (snapshot) => {
      if (snapshot.empty && !ordersLoadedRef.current) {
        ordersLoadedRef.current = true;
        try {
          const batch = writeBatch(db);
          INITIAL_ORDERS.forEach((order) => {
            const docRef = doc(db, 'orders', order.id);
            batch.set(docRef, sanitizeForFirestore(order));
          });
          await batch.commit();
        } catch (err) {
          console.error("Error seeding initial pizza orders:", err);
        }
      } else {
        ordersLoadedRef.current = true;
        const loadedOrders: Order[] = [];
        let hasNewOrder = false;
        let newOrderObj: Order | null = null;

        snapshot.forEach((docSnap) => {
          const order = docSnap.data() as Order;
          loadedOrders.push(order);

          // Trigger notification for brand new orders placed during this session
          const orderTime = new Date(order.timestamp).getTime();
          if (
            orderTime > mountTimeRef.current &&
            !notifiedOrdersRef.current.includes(order.id) &&
            (order.status === 'paid' || order.status === 'received')
          ) {
            notifiedOrdersRef.current.push(order.id);
            hasNewOrder = true;
            newOrderObj = order;
          }
        });

        loadedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setOrders(loadedOrders);

        if (hasNewOrder && newOrderObj) {
          playSynthesizedSound('bell');
          // Async load the notification helper to keep bundle slim
          import('../lib/messaging').then(({ sendLocalNotification }) => {
            sendLocalNotification(
              "Nouvelle Commande ! 🍕",
              `Commande #${newOrderObj!.id} de ${newOrderObj!.clientName} (${newOrderObj!.total.toLocaleString('fr-FR')} FCFA)`
            );
          });
        }
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Auto calculate metrics
  useEffect(() => {
    const totalRev = orders.reduce((acc, curr) => acc + curr.total, 0);
    const categoryTotals: Record<string, number> = {
      'Pizzas Classiques': 0, 'Pizzas Signatures': 0, 'Pizzas Spéciales': 0, 'Accompagnements': 0, 'Boissons': 0, 'Desserts': 0
    };
    const productSalesCount: Record<string, { count: number; image: string; price: number; name: string }> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.product.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.finalPrice * item.quantity);
        
        if (!productSalesCount[item.product.id]) {
          productSalesCount[item.product.id] = {
            count: 0,
            image: item.product.image,
            price: item.product.price,
            name: item.product.name
          };
        }
        productSalesCount[item.product.id].count += item.quantity;
      });
    });

    const topProducts = Object.values(productSalesCount)
      .map(item => ({
        name: item.name,
        salesCount: item.count,
        image: item.image,
        revenue: item.count * item.price
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 3);

    const categorySales = Object.entries(categoryTotals)
      .map(([category, value]) => ({ category, value }))
      .filter(item => item.value > 0);

    const hourlyRevenue = [
      { hour: '11:00', amount: Math.round(totalRev * 0.35), count: Math.ceil(orders.length * 0.4) },
      { hour: '12:00', amount: Math.round(totalRev * 0.65), count: Math.floor(orders.length * 0.6) }
    ];

    setMetrics({
      totalRevenue: totalRev,
      averagePrepTime: 10,
      orderCount: orders.length,
      topProducts,
      categorySales,
      hourlyRevenue
    });
  }, [orders]);

  const switchRole = (newRole: 'customer' | 'management') => {
    playSynthesizedSound('click');
    setRole(newRole);
  };

  const addToCart = (product: Product, quantity: number, customization?: PizzaCustomization) => {
    playSynthesizedSound('pop');
    let customId = product.id;
    let computedPrice = product.price;

    if (customization) {
      const parts = [
        customization.pate,
        customization.taille,
        customization.fromages.sort().join(','),
        customization.supplements.sort().join(','),
        customization.accompagnements.sort().join(',')
      ];
      customId = `${product.id}-${parts.join('-')}`;

      // Price increments for larger sizes or extra cheese/toppings
      if (customization.taille === 'Grande') computedPrice += 1500;
      if (customization.taille === 'Géante') computedPrice += 3000;
      
      computedPrice += customization.fromages.length * 600;
      computedPrice += customization.supplements.length * 800;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === customId);
      if (existing) {
        return prev.map(item => 
          item.id === customId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: customId,
        product,
        quantity,
        customization,
        finalPrice: computedPrice
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    playSynthesizedSound('click');
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    playSynthesizedSound('click');
    setCart(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromo = (code: string): boolean => {
    playSynthesizedSound('click');
    const normalized = code.trim().toUpperCase();
    if (normalized === 'HUINEST15' || normalized === 'HUINEST') {
      setActivePromo({ code: 'HUINEST15', discountPercent: 15 });
      playSynthesizedSound('success');
      return true;
    }
    if (normalized === 'PIZZA20') {
      setActivePromo({ code: 'PIZZA20', discountPercent: 20 });
      playSynthesizedSound('success');
      return true;
    }
    return false;
  };

  const removePromo = () => {
    setActivePromo(null);
  };

  const placeOrder = (clientName: string, phone: string, address: string, paymentMethod: PaymentMethod, notes?: string): Order => {
    playSynthesizedSound('cash');
    const subtotal = cart.reduce((acc, curr) => acc + (curr.finalPrice * curr.quantity), 0);
    const discount = activePromo ? Math.round(subtotal * (activePromo.discountPercent / 100)) : 0;
    const finalTotal = subtotal - discount;
    const pointsEarned = Math.floor(finalTotal / 100);

    const maxExistingId = orders.reduce((max, o) => Math.max(max, parseInt(o.id) || 0), 102);
    const nextOrderNumber = String(maxExistingId + 1);

    const newOrder: Order = {
      id: nextOrderNumber,
      items: [...cart],
      total: finalTotal,
      status: 'paid',
      paymentMethod,
      phone,
      address,
      clientName,
      notes,
      pointsEarned,
      timestamp: new Date().toISOString(),
      deliveryTimeEst: 25
    };

    setDoc(doc(db, 'orders', nextOrderNumber), sanitizeForFirestore(newOrder)).catch((err) => {
      console.error("Error creating order in Firestore:", err);
    });

    clearCart();
    setActivePromo(null);

    setTimeout(() => {
      playSynthesizedSound('bell');
    }, 1200);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    playSynthesizedSound('click');
    if (status === 'ready') {
      playSynthesizedSound('bell');
    } else if (status === 'delivered') {
      playSynthesizedSound('success');
    }

    const orderDocRef = doc(db, 'orders', orderId);
    updateDoc(orderDocRef, { status }).catch((err) => {
      console.error("Error updating order status:", err);
    });
  };

  const assignCourier = (orderId: string, courierName: string) => {
    playSynthesizedSound('click');
    const orderDocRef = doc(db, 'orders', orderId);
    updateDoc(orderDocRef, {
      courierName,
      courierPhone: '07 01 23 45 67',
      status: 'delivering'
    }).catch((err) => {
      console.error("Error assigning courier:", err);
    });
  };

  const triggerSound = (type: 'click' | 'success' | 'bell' | 'cash' | 'pop') => {
    playSynthesizedSound(type);
  };

  return (
    <AppContext.Provider value={{
      role,
      switchRole,
      products,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      activePromo,
      applyPromo,
      removePromo,
      orders,
      placeOrder,
      updateOrderStatus,
      assignCourier,
      metrics,
      triggerSound
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};