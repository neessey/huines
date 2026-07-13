import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, PaymentMethod } from '../types';
import { X, Smartphone, CheckCircle, ShieldCheck, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

const PAYMENT_METHOD: PaymentMethod = 'wave';

// ⚠️ Remplace ceci par ton vrai lien marchand Wave (Wave Business Portal → Liens de paiement)
// Format attendu : https://pay.wave.com/m/M_xxxxxxxxxxxx/c/ci/
const WAVE_MERCHANT_LINK = 'https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/';

function buildWaveCheckoutUrl(amount: number) {
  // Wave accepte un montant en FCFA (entier, sans décimales) en paramètre `amount`
  const url = new URL(WAVE_MERCHANT_LINK);
  url.searchParams.set('amount', String(Math.round(amount)));
  return url.toString();
}

export default function CheckoutModal({ onClose, onOrderPlaced }: CheckoutModalProps) {
  const { cart, activePromo, placeOrder, triggerSound } = useApp();

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Cocody Mermoz');
  const [notes, setNotes] = useState('');

  const [paymentStep, setPaymentStep] = useState<'form' | 'awaiting_validation'>('form');
  const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(null);
  const [waveUrl, setWaveUrl] = useState<string>('');

  const subtotal = cart.reduce((acc, curr) => acc + (curr.finalPrice * curr.quantity), 0);
  const discountAmount = activePromo ? Math.round(subtotal * (activePromo.discountPercent / 100)) : 0;
  const total = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim() || !address.trim()) {
      alert('Veuillez remplir les informations obligatoires.');
      return;
    }

    triggerSound('click');

    // La commande est enregistrée tout de suite, en attente de validation manuelle du paiement
    const newOrder = placeOrder(clientName, phone, address, PAYMENT_METHOD, notes);
    setPlacedOrderDetails(newOrder);

    const url = buildWaveCheckoutUrl(total);
    setWaveUrl(url);

    // Ouvre le vrai lien de paiement Wave dans un nouvel onglet
    window.open(url, '_blank', 'noopener,noreferrer');

    setPaymentStep('awaiting_validation');
  };

  const handleContinue = () => {
    if (!placedOrderDetails) return;
    triggerSound('click');
    onOrderPlaced(placedOrderDetails);
  };

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[32px] overflow-hidden max-w-lg w-full p-8 shadow-2xl relative text-left"
      >
        {/* CLOSE */}
        <button
          id="checkout-close"
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-bros-gray hover:bg-gray-200 flex items-center justify-center text-bros-black cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <AnimatePresence mode="wait">
          {paymentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="font-display font-extrabold text-2xl text-bros-black">Finaliser la Commande</h3>
              <p className="text-xs text-bros-text mt-1">Saisissez vos coordonnées pour le retrait en restaurant.</p>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">

                {/* NOM */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Votre Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Marc-Antoine Koffi"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-bros-red/30 focus:ring-4 focus:ring-bros-red/5 transition-all"
                  />
                </div>

                {/* TELEPHONE */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Numéro de téléphone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="ex: 07 08 09 10 11"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3 pl-11 text-xs outline-none focus:bg-white focus:border-bros-red/30 focus:ring-4 focus:ring-bros-red/5 transition-all"
                    />
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Utilisé pour te contacter en cas de besoin.</span>
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remarques pour la cuisine (Optionnel)</label>
                  <textarea
                    placeholder="ex: Bien cuite au feu de bois, pâte fine, pas d'olives..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-bros-gray border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-bros-red/30 transition-all resize-none"
                  />
                </div>

                {/* PAIEMENT : Wave uniquement */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Moyen de paiement</label>
                  <div className="p-3 rounded-xl border border-sky-400 bg-sky-400/5 flex items-center gap-2.5">
<img
  src="/assets/wave.jpg"
  alt="Wave"
  className="w-5 h-5 object-contain"
/>                    <span className="text-[11px] font-bold text-bros-black">Wave Côte d'Ivoire</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 block">Tu seras redirigé vers Wave pour payer, puis ta commande sera validée manuellement par notre équipe.</span>
                </div>

                {/* SUMBIT BUTTON */}
                <div className="border-t border-gray-100 pt-5 mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">À Payer</span>
                    <span className="font-mono font-extrabold text-base text-bros-black">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-bros-red hover:bg-bros-red/90 text-white text-xs font-semibold rounded-xl shadow-lg shadow-bros-red/10 cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Payer avec Wave
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            </motion.div>
          )}

          {paymentStep === 'awaiting_validation' && placedOrderDetails && (
            <motion.div
              key="awaiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center border border-sky-100">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-display font-extrabold text-xl text-bros-black">Commande enregistrée</h4>
                <p className="text-xs text-bros-text mt-2 max-w-sm mx-auto leading-relaxed">
                  Ta commande <strong className="text-bros-black">#{placedOrderDetails.id}</strong> est enregistrée. Un onglet Wave s'est ouvert pour le paiement de <strong>{total.toLocaleString('fr-FR')} FCFA</strong>.
                </p>
              </div>

              <div className="bg-bros-gray/50 border border-gray-100 p-4 rounded-2xl max-w-xs w-full text-left space-y-2">
                <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Instructions :</span>
                <p className="text-[10px] text-bros-text leading-snug">
                  1. Termine le paiement dans l'onglet Wave ouvert.<br />
                  2. Notre équipe valide manuellement chaque paiement reçu.<br />
                  3. Tu recevras une confirmation dès que c'est validé.
                </p>
              </div>

              {/* Au cas où le popup a été bloqué */}
              <a
                href={waveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1.5 underline underline-offset-2"
              >
                L'onglet ne s'est pas ouvert ? Clique ici pour payer sur Wave
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="font-mono text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Validation manuelle — pas de confirmation automatique
              </span>

              <button
                id="checkout-track-btn"
                onClick={handleContinue}
                className="w-full py-4 bg-bros-black hover:bg-bros-red text-white text-xs font-semibold rounded-2xl shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Suivre ma commande
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}