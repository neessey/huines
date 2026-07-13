import React from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { Clock, Phone, MapPin, Bike, Check, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

export default function OrderTracking({ order, onClose }: OrderTrackingProps) {
  const { orders } = useApp();

  // Find the latest state of this order from the system database
  const liveOrder = orders.find(o => o.id === order.id) || order;

  const steps: { label: string; status: OrderStatus;  desc: string }[] = [
    { label: 'Paiement', status: 'paid',  desc: 'Débité avec succès' },
    { label: 'Reçue', status: 'received', desc: 'En attente de validation' },
    { label: 'En cuisine', status: 'preparing',  desc: 'Préparation artisanale' },
    { label: 'Prête', status: 'ready',  desc: 'Prête au comptoir' },
    { label: 'En livraison', status: 'delivering', desc: 'Livreur en route' },
    { label: 'Livrée', status: 'delivered',  desc: 'Bon appétit !' }
  ];

 const getStepState = (stepStatus: OrderStatus): 'done' | 'active' | 'pending' => {
  const statusPriority: Record<OrderStatus, number> = {
    paid: 0,
    received: 1,
    preparing: 2,
    ready: 3,
    delivering: 4,
    delivered: 5
  };

  // Si la commande est livrée, toutes les étapes sont terminées
  if (liveOrder.status === 'delivered') {
    return 'done';
  }

  const currentPriority = statusPriority[liveOrder.status];
  const stepPriority = statusPriority[stepStatus];

  if (currentPriority > stepPriority) return 'done';
  if (currentPriority === stepPriority) return 'active';
  return 'pending';
};

  return (
    <div id="tracking-portal" className="max-w-2xl mx-auto py-12 px-4 text-left">
      <div className="flex flex-col gap-6">
        
        {/* TOP GLOWING STATUS CARD */}
        <div className="bg-bros-black text-white rounded-[28px] p-6 md:p-8 relative overflow-hidden shadow-2xl">
          {/* Neon lights ornament */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-bros-red/25 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-bros-blue/20 rounded-full blur-3xl -z-10"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400 tracking-widest block">Suivi de la commande</span>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl mt-1">Commande #{liveOrder.id}</h2>
              <p className="text-xs text-gray-300 mt-2">
                Adresse : <strong className="text-white">{liveOrder.address}</strong>
              </p>
            </div>

            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <Clock className="w-5 h-5 text-bros-gold animate-pulse" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">Temps Restant</span>
                <span className="font-mono font-extrabold text-sm text-white">
                  {liveOrder.status === 'delivered' ? 'Livrée' : `${liveOrder.deliveryTimeEst} mins`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE PROGRESS TRACKER */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <h3 className="font-display font-extrabold text-base text-bros-black mb-6">Étapes de préparation</h3>

          <div className="space-y-6 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {steps.map((step, index) => {
              const state = getStepState(step.status);
              return (
                <div key={index} className="relative flex justify-between items-center group">
                  {/* Circle indicator */}
                  <div className={`absolute -left-[30px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    state === 'done'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : state === 'active'
                      ? 'bg-white border-bros-red text-bros-red animate-pulse'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {state === 'done' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step details */}
                  <div className="text-left flex-1 pl-4">
                    <span className={`font-display text-xs font-bold transition-colors ${
  state === 'done'
    ? 'text-emerald-600'
    : state === 'active'
    ? 'text-bros-red font-extrabold'
    : 'text-bros-black'
}`}
                    >
                       {step.label}
                    </span>
                    <p className="text-[10px] text-bros-text font-medium mt-0.5">{step.desc}</p>
                  </div>

                  {/* Pulsing beacon for active state */}
{state === 'active' && liveOrder.status !== 'delivered' && (
                      <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bros-red opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bros-red"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

       {/* Informations de la commande */}
<div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
  <h3 className="font-display font-extrabold text-base text-bros-black mb-6">
    Informations de livraison
  </h3>

  <div className="space-y-5">

    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <MapPin className="w-5 h-5" />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
          Adresse de livraison
        </p>

        <p className="font-semibold text-bros-black mt-1">
          {liveOrder.address}
        </p>
      </div>
    </div>

    <div className="border-t border-gray-100 pt-5 flex justify-between items-center">

      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
          Temps estimé
        </p>

        <p className="font-display text-xl font-extrabold text-bros-black mt-1">
          {liveOrder.status === 'delivered'
            ? 'Commande livrée'
            : `${liveOrder.deliveryTimeEst} min`}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
          Statut
        </p>

        <p className="font-semibold text-amber-500 mt-1">
          {steps.find(step => step.status === liveOrder.status)?.label}
        </p>
      </div>

    </div>

  </div>
</div>

        {/* Back to Home CTA */}
        <button
          onClick={onClose}
          className="w-full py-4 border border-gray-200 hover:bg-bros-gray text-bros-black font-semibold text-xs rounded-2xl transition-all cursor-pointer text-center"
        >
          Retourner au menu principal
        </button>

      </div>
    </div>
  );
}
