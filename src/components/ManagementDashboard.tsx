import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { 
  Flame, Clock, AlertTriangle, ChefHat, MapPin, Phone, CheckCircle, 
  TrendingUp, ShoppingCart, Percent, Plus, ShieldCheck, Search, LogOut, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestNotificationPermission } from '../lib/messaging';

export default function ManagementDashboard() {
  const { 
    orders, metrics, updateOrderStatus, triggerSound 
  } = useApp();

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('huinest_staff_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Notification permission state
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    triggerSound('click');
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  // Tab switching: 'kds' | 'analytics'
  const [activeTab, setActiveTab] = useState<'kds' | 'analytics'>('kds');

  // KDS Stations: 'all' | 'pizza' | 'other'
  const [activeStation, setActiveStation] = useState<'all' | 'pizza' | 'other'>('all');

  // Analytics coupon state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountInput, setPromoDiscountInput] = useState(15);
  const [promosList, setPromosList] = useState<{ code: string; discount: number }[]>([
    { code: 'HUINEST15', discount: 15 },
    { code: 'PIZZA20', discount: 20 },
  ]);

  // Analytics table filter and search
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Re-render tick timer to update KDS elapsed timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toLowerCase();
    if (cleanPassword === '8nu1est*' || cleanPassword === '8nu1est*food') {
      triggerSound('success');
      setIsAuthenticated(true);
      localStorage.setItem('huinest_staff_auth', 'true');
      setAuthError('');
    } else {
      triggerSound('bell');
      setAuthError('Mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    triggerSound('click');
    setIsAuthenticated(false);
    localStorage.removeItem('huinest_staff_auth');
    setPassword('');
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const normalizedCode = promoCodeInput.trim().toUpperCase();
    setPromosList(prev => [...prev, { code: normalizedCode, discount: promoDiscountInput }]);
    triggerSound('success');
    setPromoCodeInput('');
    alert(`Code coupon ${normalizedCode} (-${promoDiscountInput}%) créé. Il est utilisable au panier !`);
  };

  // Helper for KDS urgency colors
  const getUrgencyColor = (timestampStr: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(timestampStr).getTime()) / 60000);
    if (elapsedMinutes >= 15) return 'border-red-500 bg-red-50 text-red-700'; // Critical
    if (elapsedMinutes >= 8) return 'border-amber-500 bg-amber-50 text-amber-700'; // Medium
    return 'border-emerald-200 bg-emerald-50/50 text-emerald-800'; // Normal
  };

  const getElapsedTimeStr = (timestampStr: string) => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestampStr).getTime()) / 1000));
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Gated Password Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-bros-gray/40">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-2xl max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-display font-extrabold text-2xl text-bros-black">Accès Professionnel</h3>
            <p className="text-xs text-bros-text mt-1 max-w-xs mx-auto">
              L'écran de cuisine et de gestion est protégé. Veuillez saisir le mot de passe staff de Huinestfood.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <input 
                type="password" 
                required
                placeholder="Mot de passe d'accès" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3.5 text-center text-sm font-semibold outline-none focus:bg-white focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 transition-all"
              />
              {authError && (
                <p className="text-[11px] text-red-600 font-bold">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer transition-transform font-display uppercase tracking-wider"
            >
              Déverrouiller la Console
            </button>
          </form>

          <p className="text-[10px] text-gray-400 font-mono">
            Espace réservé à la direction et aux pizzaïolos.
          </p>
        </motion.div>
      </div>
    );
  }

  // --- FILTERS & STATES ---
  // Kitchen (KDS) orders
  const kitchenOrders = orders.filter(o => o.status === 'paid' || o.status === 'received' || o.status === 'preparing');
  const filteredKdsOrders = kitchenOrders.filter(order => {
    if (activeStation === 'all') return true;
    const hasPizzas = order.items.some(item => item.product.category.startsWith('Pizzas'));
    if (activeStation === 'pizza') return hasPizzas;
    return !hasPizzas; // other items
  });

  // Pickup orders: ready at counter for client collection
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Analytics filtered orders
  const filteredAnalyticsOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          order.id.includes(orderSearch);
    const matchesFilter = orderFilter === 'all' || 
                          (orderFilter === 'pending' && order.status !== 'delivered') ||
                          (orderFilter === 'delivered' && order.status === 'delivered');
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-mono font-bold text-[10px]">PAYÉ</span>;
      case 'received':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-mono font-bold text-[10px]">REÇU</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-mono font-bold text-[10px] animate-pulse">EN CUISINE</span>;
      case 'ready':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-mono font-bold text-[10px]">PRÊT (RETRAIT)</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 font-mono font-bold text-[10px]">RETIRÉ / FINI</span>;
      default:
        return null;
    }
  };

  const maxHourlyValue = Math.max(...metrics.hourlyRevenue.map(h => h.amount), 5000);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 text-left space-y-10">
      
      {/* PROFESSIONAL NAV BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-amber-500 tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            HUINESTFOOD CONSOLE PROFESSIONNELLE UNIFIÉE
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-bros-black mt-1">Espace de Gestion de l'Enseigne</h2>
          <p className="text-xs text-bros-text mt-1">
            Gérez vos commandes, coordonnez la cuisine et validez les retraits clients en temps réel.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-red-100"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion Staff
        </button>
      </div>

      {/* TWO INTERACTIVE VIEW CHIPS */}
      <div className="flex flex-wrap gap-3 bg-bros-gray p-2 rounded-2xl border border-gray-100 w-fit">
        <button
          onClick={() => { triggerSound('click'); setActiveTab('kds'); }}
          className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'kds' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10' 
              : 'text-gray-600 hover:text-bros-black'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          Commandes Actives {(kitchenOrders.length > 0 || readyOrders.length > 0) && `(${kitchenOrders.length + readyOrders.length})`}
        </button>

        <button
          onClick={() => { triggerSound('click'); setActiveTab('analytics'); }}
          className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10' 
              : 'text-gray-600 hover:text-bros-black'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Finances & Analyses
        </button>
      </div>

      {/* TAB CONTENT: 1. UNIFIED COMMANDES DISPLAY */}
      {activeTab === 'kds' && (
        <div className="space-y-8">
          
          {/* NOTIFICATION ENABLE ALERT CARD */}
          {notificationStatus !== 'granted' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1 text-left">
                <h4 className="font-display font-bold text-sm text-bros-black flex items-center gap-2">
                  <span>🔔</span> Activez les notifications sonores et visuelles !
                </h4>
                <p className="text-xs text-bros-text">
                  Soyez prévenu par un signal sonore et un push de bureau dès qu'un client passe commande à Abidjan.
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
              >
                Autoriser les Notifications
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLUMN 1: KITCHEN PREPARATION (Statuses: paid, received, preparing) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-bros-black flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-500" />
                    En Cuisine & Préparation
                  </h3>
                  <p className="text-xs text-bros-text mt-0.5">Pizzas en cours d'assemblage ou de cuisson.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-bold border border-amber-100">
                  {kitchenOrders.length} active{kitchenOrders.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Station switcher */}
              <div className="flex gap-1.5 bg-bros-gray p-1 rounded-xl border border-gray-100 text-[11px] w-fit">
                <button
                  onClick={() => { triggerSound('click'); setActiveStation('all'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeStation === 'all' ? 'bg-white text-bros-black shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Tout
                </button>
                <button
                  onClick={() => { triggerSound('click'); setActiveStation('pizza'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeStation === 'pizza' ? 'bg-white text-bros-black shadow-sm' : 'text-gray-500'
                  }`}
                >
                  🍕 Pizzas
                </button>
                <button
                  onClick={() => { triggerSound('click'); setActiveStation('other'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeStation === 'other' ? 'bg-white text-bros-black shadow-sm' : 'text-gray-500'
                  }`}
                >
                  🥤 Autres
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredKdsOrders.length > 0 ? (
                    filteredKdsOrders.map((order) => {
                      const elapsedMinutes = Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 60000);
                      const urgencyClass = getUrgencyColor(order.timestamp);
                      return (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
                        >
                          {/* Order timer header */}
                          <div className={`p-4 border-b flex justify-between items-center ${urgencyClass}`}>
                            <div className="flex items-center gap-2 text-left">
                              <span className="font-mono text-xs font-extrabold">#{order.id}</span>
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/50 truncate max-w-[80px]">{order.clientName}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold">{getElapsedTimeStr(order.timestamp)}</span>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex-grow space-y-3">
                            {elapsedMinutes >= 15 && (
                              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-100/50 border border-red-200 text-red-800 text-[9px] font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                <span>RETARD (+15 MINS)</span>
                              </div>
                            )}

                            <div className="space-y-2">
                              {order.items.map((item, index) => {
                                const isPizza = item.product.category.startsWith('Pizzas');
                                const shouldShow = activeStation === 'all' || (activeStation === 'pizza' && isPizza) || (activeStation === 'other' && !isPizza);
                                if (!shouldShow) return null;

                                return (
                                  <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 text-left">
                                    <p className="font-display font-bold text-xs text-bros-black">
                                      <span className="text-amber-500 font-extrabold mr-1">x{item.quantity}</span>
                                      {item.product.name}
                                    </p>
                                    
                                    {item.customization && (
                                      <div className="mt-1 bg-bros-gray p-1.5 rounded-md space-y-0.5 text-[8px] text-gray-500 font-semibold leading-normal">
                                        <p className="text-bros-black font-bold">
                                          Pâte: {item.customization.pate} • Taille: {item.customization.taille}
                                        </p>
                                        {item.customization.fromages && item.customization.fromages.length > 0 && (
                                          <p className="text-yellow-600">🧀 Fromages: {item.customization.fromages.join(', ')}</p>
                                        )}
                                        {item.customization.supplements && item.customization.supplements.length > 0 && (
                                          <p className="text-red-500">🥓 Toppings: {item.customization.supplements.join(', ')}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {order.notes && (
                              <div className="bg-yellow-50 border border-yellow-200/40 p-2 rounded-lg text-left">
                                <span className="font-mono text-[8px] font-bold text-yellow-700 block">Note client :</span>
                                <p className="text-[9px] text-yellow-800 leading-tight">{order.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Action trigger */}
                          <div className="p-3 bg-bros-gray/30 border-t border-gray-100">
                            {order.status === 'paid' || order.status === 'received' ? (
                              <button
                                onClick={() => { triggerSound('click'); updateOrderStatus(order.id, 'preparing'); }}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                              >
                                Commencer la cuisson ⚡
                              </button>
                            ) : (
                              <button
                                onClick={() => { triggerSound('success'); updateOrderStatus(order.id, 'ready'); }}
                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                              >
                                Marquer comme Prête ✔
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center bg-bros-gray/30 rounded-3xl border border-dashed border-gray-200">
                      <ChefHat className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
                      <h4 className="font-display font-bold text-xs text-bros-black mt-3">Aucune pizza en préparation</h4>
                      <p className="text-[11px] text-bros-text mt-0.5">Les nouvelles commandes apparaîtront ici.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* COLUMN 2: PRÊTES AU COMPTOIR (Attente Retrait par le Client - Status: ready) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-bros-black flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Prêtes au Comptoir
                  </h3>
                  <p className="text-xs text-bros-text mt-0.5">Attente du client pour le retrait en restaurant.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-100">
                  {readyOrders.length}
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {readyOrders.length > 0 ? (
                    readyOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm space-y-4 text-left hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-emerald-600">En attente du client</span>
                            <h4 className="font-display font-extrabold text-sm text-bros-black">Commande #{order.id}</h4>
                          </div>
                          <span className="font-mono text-xs font-extrabold text-bros-black">
                            {order.total.toLocaleString('fr-FR')} F
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <p><strong>Client :</strong> {order.clientName} ({order.phone})</p>
                          <p><strong>Point de Retrait :</strong> {order.address}</p>
                          <p className="text-gray-400 text-[10px]">Commandé à {new Date(order.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="bg-bros-gray/50 p-3 rounded-xl text-[11px] space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Pizzas :</span>
                          {order.items.map((item, i) => (
                            <p key={i} className="font-bold text-bros-black">
                              x{item.quantity} {item.product.name}
                            </p>
                          ))}
                        </div>

                        <button
                          onClick={() => { triggerSound('success'); updateOrderStatus(order.id, 'delivered'); }}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 font-display uppercase tracking-wider text-[11px]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Valider le Retrait Client</span>
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-bros-gray/30 rounded-3xl border border-dashed border-gray-200">
                      <span className="text-2xl block">📦</span>
                      <h4 className="font-display font-bold text-xs text-bros-black mt-3">Comptoir vide</h4>
                      <p className="text-[11px] text-bros-text mt-0.5">Aucune commande n'est actuellement en attente de retrait.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. OPERATIONS ANALYTICS & CODE COUPON CREATOR */}
      {activeTab === 'analytics' && (
        <div className="space-y-10">
          {/* METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Chiffre d'Affaires</span>
                <h3 className="font-mono font-extrabold text-xl text-bros-black mt-0.5">
                  {metrics.totalRevenue.toLocaleString('fr-FR')} F
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">100% Mobile Money</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/5 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/10">
                <ShoppingCart className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Commandes Totales</span>
                <h3 className="font-mono font-extrabold text-xl text-bros-black mt-0.5">
                  {metrics.orderCount}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium">Flux en direct</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/5 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/10">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Préparation Moyenne</span>
                <h3 className="font-mono font-extrabold text-xl text-bros-black mt-0.5">
                  {metrics.averagePrepTime} mins
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">Cible respectée</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/5 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/10">
                <Percent className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Coupons Actifs</span>
                <h3 className="font-mono font-extrabold text-xl text-bros-black mt-0.5">
                  {promosList.length}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium">Codes Promotionnels</span>
              </div>
            </div>
          </div>

          {/* GRAPHICS & BAR CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SVG Hourly Sales */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h3 className="font-display font-extrabold text-base text-bros-black">Chiffre d'Affaires par Heure (FCFA)</h3>
              <p className="text-xs text-bros-text mt-0.5">Visualisez les pics de commandes de la journée.</p>

              <div className="h-64 mt-8 flex items-end justify-between gap-4">
                {metrics.hourlyRevenue.map((hour, idx) => {
                  const pct = (hour.amount / maxHourlyValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="opacity-0 group-hover:opacity-100 bg-bros-black text-white font-mono text-[9px] font-bold py-1 px-2 rounded-lg transition-all shadow-md leading-none whitespace-nowrap">
                        {hour.amount.toLocaleString('fr-FR')} F
                      </span>
                      <div className="w-full bg-bros-gray group-hover:bg-amber-500/10 rounded-xl overflow-hidden h-full flex items-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 5)}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`w-full rounded-t-xl transition-colors ${
                            hour.amount > 0 ? 'bg-amber-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-gray-400">{hour.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupons & Lists creator */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-display font-extrabold text-base text-bros-black">Créateur de code Coupon</h3>
              <form onSubmit={handleAddPromo} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Code Coupon</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: KOFFI25" 
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-amber-500/50 transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Réduction (%)</label>
                  <input 
                    type="number" 
                    min={5}
                    max={50}
                    required
                    value={promoDiscountInput}
                    onChange={(e) => setPromoDiscountInput(parseInt(e.target.value) || 15)}
                    className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-amber-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-bros-black hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer le coupon</span>
                </button>
              </form>

              <div className="pt-3 border-t border-gray-100 text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Coupons opérationnels:</span>
                <div className="flex flex-wrap gap-2">
                  {promosList.map((p, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-bros-gray border border-gray-200 text-gray-700 font-mono text-[9px] font-bold">
                      🏷️ {p.code} (-{p.discount}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ALL ORDERS TABLE LIST */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-extrabold text-base text-bros-black">Registre des Ventes de Pizza</h3>
                <span className="text-xs text-bros-text mt-0.5">Visualisez et modifiez l'état de n'importe quelle commande.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Rechercher client..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-bros-gray border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white"
                />
                <select 
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="bg-bros-gray border border-gray-100 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none"
                >
                  <option value="all">Toutes</option>
                  <option value="pending">En cours</option>
                  <option value="delivered">Livrées</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-bros-gray/40">
                    <th className="py-4.5 px-4 font-mono">ID</th>
                    <th className="py-4.5 px-4">Client</th>
                    <th className="py-4.5 px-4">Lieu</th>
                    <th className="py-4.5 px-4">Heure</th>
                    <th className="py-4.5 px-4">Pizza(s)</th>
                    <th className="py-4.5 px-4">Total</th>
                    <th className="py-4.5 px-4">Statut</th>
                    <th className="py-4.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <AnimatePresence mode="popLayout">
                    {filteredAnalyticsOrders.length > 0 ? (
                      filteredAnalyticsOrders.map(order => (
                        <motion.tr key={order.id} layout className="hover:bg-bros-gray/20 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-bros-black">#{order.id}</td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-bros-black block">{order.clientName}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{order.phone}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-bros-black">{order.address.split(',')[0]}</td>
                          <td className="py-4 px-4 text-gray-400 font-mono">
                            {new Date(order.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 px-4 truncate max-w-[200px]">
                            {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                          </td>
                          <td className="py-4 px-4 font-mono font-extrabold text-bros-black">
                            {order.total.toLocaleString('fr-FR')} F
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                          <td className="py-4 px-4 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="bg-bros-gray/80 hover:bg-gray-200 border border-transparent rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-gray-700 outline-none transition-all cursor-pointer inline-block"
                            >
                              <option value="paid">Payé</option>
                              <option value="received">Reçu</option>
                              <option value="preparing">En cuisine</option>
                              <option value="ready">Prêt</option>
                              <option value="delivering">En livraison</option>
                              <option value="delivered">Livré</option>
                            </select>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          Aucune commande enregistrée.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
