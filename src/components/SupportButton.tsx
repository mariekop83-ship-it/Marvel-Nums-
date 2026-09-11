import React, { useState, useEffect } from 'react';
import { MessageSquare, Headphones, X } from 'lucide-react';
import { api } from '../api/client';

export const SupportButton: React.FC = () => {
  const [supportData, setSupportData] = useState<{
    whatsappNumber: string;
    whatsappSupportName: string;
    whatsappDefaultMessage: string;
  } | null>(null);

  useEffect(() => {
    api.getSupportSettings().then(setSupportData).catch(console.error);
  }, []);

  const openWhatsApp = () => {
    const number = supportData?.whatsappNumber?.replace(/[^0-9]/g, '') || '2348000000000';
    const text = encodeURIComponent(supportData?.whatsappDefaultMessage || 'Hello Marvel Nums Support, I need assistance with my account/wallet.');
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  return (
    <button
      id="floating-support-btn"
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
      title="Chat with WhatsApp Support"
    >
      <div className="relative">
        <Headphones className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-emerald-400 animate-ping" />
      </div>
      <span className="hidden sm:inline font-extrabold tracking-wide">
        WhatsApp Desk
      </span>
    </button>
  );
};
