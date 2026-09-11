import React from 'react';
import {
  LayoutDashboard,
  PhoneCall,
  MessageSquareText,
  Clock,
  Wallet,
  User as UserIcon,
  Headphones,
  Shield,
  Zap,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  activeNumbersCount: number;
  onOpenSupport: () => void;
  onOpenAdmin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  activeNumbersCount,
  onOpenSupport,
  onOpenAdmin
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'buy',
      label: 'Buy Number',
      icon: PhoneCall,
      badge: 'Live'
    },
    {
      id: 'my-numbers',
      label: 'Active Numbers',
      icon: MessageSquareText,
      badge: activeNumbersCount > 0 ? activeNumbersCount : null,
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: Clock,
      badge: null
    },
    {
      id: 'wallet',
      label: 'Wallet & Deposits',
      icon: Wallet,
      badge: null
    },
    {
      id: 'profile',
      label: 'Profile & Security',
      icon: UserIcon,
      badge: null
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Quick Route Status Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Gateway Active</span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            3 High-Speed Carrier Servers Online with 15-Minute Countdown.
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Shortcuts */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <button
          id="sidebar-whatsapp-support-btn"
          onClick={onOpenSupport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all"
        >
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span>Contact WhatsApp Desk</span>
        </button>
      </div>
    </aside>
  );
};
