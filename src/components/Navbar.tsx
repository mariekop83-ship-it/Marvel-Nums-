import React, { useState } from 'react';
import { Shield, Wallet, Bell, LogOut, PhoneCall, Check, ExternalLink, Menu, X, Sparkles } from 'lucide-react';
import { User, UserNotification } from '../types';

interface NavbarProps {
  user: User | null;
  walletBalance: number;
  activeOrdersCount: number;
  notifications: UserNotification[];
  onOpenFundWallet: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  currentTab: string;
  onOpenAdmin: () => void;
  onMarkNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  walletBalance,
  activeOrdersCount,
  notifications,
  onOpenFundWallet,
  onOpenAuth,
  onLogout,
  onNavigate,
  currentTab,
  onOpenAdmin,
  onMarkNotificationsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Marvel<span className="text-emerald-400">Nums</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.4 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Fast Virtual Numbers & Instant OTP</p>
            </div>
          </button>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Wallet Balance Pill */}
              <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 pl-3.5 shadow-inner">
                <div className="flex items-center gap-2 mr-3">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium leading-none">Wallet</div>
                    <div className="text-sm font-bold text-white font-mono leading-tight">
                      ₦{walletBalance.toLocaleString('en-NG')}
                    </div>
                  </div>
                </div>
                <button
                  id="navbar-fund-wallet-btn"
                  onClick={onOpenFundWallet}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  + Fund
                </button>
              </div>

              {/* Active Numbers Badge */}
              {activeOrdersCount > 0 && (
                <button
                  onClick={() => onNavigate('my-numbers')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold animate-pulse transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{activeOrdersCount} Waiting OTP</span>
                </button>
              )}

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  id="navbar-notifications-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadCount > 0) {
                      onMarkNotificationsRead();
                    }
                  }}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                      <span className="text-[11px] text-slate-400">{notifications.length} updates</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs transition-all ${
                              n.read ? 'bg-slate-950/60 text-slate-400' : 'bg-emerald-950/20 border border-emerald-500/30 text-slate-200'
                            }`}
                          >
                            <div className="font-semibold text-white mb-0.5">{n.title}</div>
                            <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Menu */}
              <div className="relative">
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Account Settings
                    </button>
                    <div className="my-1 border-t border-slate-800"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center justify-between transition-colors"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="text-right mr-1">
              <div className="text-[10px] text-slate-400">Balance</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">
                ₦{walletBalance.toLocaleString('en-NG')}
              </div>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Available Funds</div>
                  <div className="text-base font-bold text-white font-mono">
                    ₦{walletBalance.toLocaleString('en-NG')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFundWallet();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  + Fund Wallet
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('buy');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 text-left text-xs font-semibold text-white border border-slate-800"
                >
                  ⚡ Buy Number
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('my-numbers');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 text-left text-xs font-semibold text-white border border-slate-800 flex items-center justify-between"
                >
                  <span>📱 My Numbers</span>
                  {activeOrdersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('orders');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 text-left text-xs font-semibold text-white border border-slate-800"
                >
                  📋 Order History
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('wallet');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 text-left text-xs font-semibold text-white border border-slate-800"
                >
                  💳 Wallet Ledger
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div></div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-rose-400 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
