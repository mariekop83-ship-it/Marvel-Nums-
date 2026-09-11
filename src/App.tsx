import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CustomerOverviewView } from './components/CustomerOverviewView';
import { LandingPageView } from './components/LandingPageView';
import { BuyNumberView } from './components/BuyNumberView';
import { ActiveNumbersView } from './components/ActiveNumbersView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { FundWalletModal } from './components/FundWalletModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { SupportButton } from './components/SupportButton';
import { api } from './api/client';
import { User, Order, Transaction, UserNotification } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const [isFundWalletOpen, setIsFundWalletOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hidden admin 6-click sequence state
  const adminClicksRef = useRef<number>(0);
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdminSecretClick = useCallback(() => {
    adminClicksRef.current += 1;
    if (adminTimerRef.current) {
      clearTimeout(adminTimerRef.current);
    }
    if (adminClicksRef.current >= 6) {
      adminClicksRef.current = 0;
      setIsAdminView(true);
      window.history.pushState({}, '', '/stevelog-admin');
      return;
    }
    // Resets after 4 seconds of inactivity so clicks are counted by the admin without displaying any count to others
    adminTimerRef.current = setTimeout(() => {
      adminClicksRef.current = 0;
    }, 4000);
  }, []);

  // Check URL pathname for admin route on initial load
  useEffect(() => {
    if (window.location.pathname.includes('stevelog-admin') || window.location.pathname.includes('marvel-admin')) {
      setIsAdminView(true);
    }
  }, []);

  // Fetch authenticated user on load (failsafe, non-blocking)
  const loadUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        setWalletBalance(res.user.balance);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Non-blocking sync for authenticated customer data
  const isRefreshingRef = useRef(false);
  const refreshUserData = useCallback(async () => {
    if (!user || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const [ordersRes, summaryRes, notifsRes] = await Promise.all([
        api.getMyOrders().catch(() => ({ orders: [] })),
        api.getWalletSummary().catch(() => ({ balance: user.balance, recentTransactions: [] })),
        api.getNotifications().catch(() => ({ notifications: [] }))
      ]);

      if (ordersRes && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
      }
      if (summaryRes && typeof summaryRes.balance === 'number') {
        setWalletBalance(summaryRes.balance);
      }
      if (summaryRes && Array.isArray(summaryRes.recentTransactions)) {
        setTransactions(summaryRes.recentTransactions);
      }
      if (notifsRes && Array.isArray(notifsRes.notifications)) {
        setNotifications(notifsRes.notifications);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData]);

  // Real-time zero-latency polling ONLY when user is logged in & tab is active
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      refreshUserData();
    }, 3500);
    return () => clearInterval(interval);
  }, [user, refreshUserData]);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setWalletBalance(0);
    setOrders([]);
    setTransactions([]);
    setNotifications([]);
    setCurrentTab('overview');
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const activeOrders = orders.filter(o => o.status === 'WAITING_SMS');

  // 1. ADMIN PANEL ROUTE
  if (isAdminView) {
    return (
      <AdminPanel
        onExitAdmin={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // 2. GUEST / UN-AUTHENTICATED VIEW:
  // "WITHOUT SIGNIN OR SIGNUP INTO THE CUSTOMER ACCOUNT THERE CAN NOT SEE THE DASHBOARD
  // TO PURCHASE NUMBER, FUND WALLET, ORDER HISTORY, WALLET AND DEPOSIT, ACTIVE NUMBER AND OVERVIEW"
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-emerald-500 selection:text-slate-950">
        
        {/* Public Header */}
        <Navbar
          user={null}
          walletBalance={0}
          activeOrdersCount={0}
          notifications={[]}
          onOpenFundWallet={() => setIsAuthModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onNavigate={() => setIsAuthModalOpen(true)}
          currentTab="home"
          onOpenAdmin={() => {
            setIsAdminView(true);
            window.history.pushState({}, '', '/stevelog-admin');
          }}
          onMarkNotificationsRead={() => {}}
        />

        {/* Public Home Page */}
        <main className="flex-1">
          <LandingPageView
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onAdminSecretClick={handleAdminSecretClick}
          />
        </main>

        {/* Floating WhatsApp Support Button */}
        <SupportButton />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={loggedInUser => {
            setUser(loggedInUser);
            setWalletBalance(loggedInUser.balance);
            setCurrentTab('overview');
            refreshUserData();
          }}
        />

        {/* Guest Footer with Silent 6-Click Admin Access */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-slate-400">
              <span
                id="admin-secret-trigger"
                onClick={handleAdminSecretClick}
                className="cursor-pointer select-none hover:text-slate-300 font-medium transition-colors"
              >
                © 2026 Marvel Nums
              </span>{' '}
              Virtual Number Infrastructure. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-slate-300">Sign In</button>
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-slate-300">Create Account</button>
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-slate-300">Pricing & Services</button>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  // 3. AUTHENTICATED CUSTOMER ACCOUNT DASHBOARD:
  // "Let there be home page that after sign in or sign up then it will display where the customer account"
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Customer Header */}
      <Navbar
        user={user}
        walletBalance={walletBalance}
        activeOrdersCount={activeOrders.length}
        notifications={notifications}
        onOpenFundWallet={() => setIsFundWalletOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={tab => setCurrentTab(tab)}
        currentTab={currentTab}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.history.pushState({}, '', '/stevelog-admin');
        }}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Body with Customer Navigation Sidebar and Content View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Customer Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={tab => setCurrentTab(tab)}
          activeNumbersCount={activeOrders.length}
          onOpenSupport={() => {
            api.getSupportSettings().then(res => {
              const num = res.whatsappNumber.replace(/[^0-9]/g, '');
              const msg = encodeURIComponent(res.whatsappDefaultMessage);
              window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
            });
          }}
          onOpenAdmin={() => {
            setIsAdminView(true);
            window.history.pushState({}, '', '/stevelog-admin');
          }}
        />

        {/* Authenticated Customer Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'overview' && (
            <CustomerOverviewView
              user={user}
              walletBalance={walletBalance}
              orders={orders}
              transactions={transactions}
              onOpenFundWallet={() => setIsFundWalletOpen(true)}
              onNavigate={tab => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'buy' && (
            <BuyNumberView
              user={user}
              walletBalance={walletBalance}
              onOpenFundWallet={() => setIsFundWalletOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOrderCompleted={() => {
                refreshUserData();
                setCurrentTab('my-numbers');
              }}
            />
          )}

          {currentTab === 'my-numbers' && (
            <ActiveNumbersView
              orders={orders}
              onRefresh={refreshUserData}
              onNavigateBuy={() => setCurrentTab('buy')}
              onBalanceUpdated={newBal => setWalletBalance(newBal)}
            />
          )}

          {currentTab === 'orders' && (
            <OrderHistoryView
              orders={orders}
              onRefresh={refreshUserData}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletView
              balance={walletBalance}
              onOpenFundWallet={() => setIsFundWalletOpen(true)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              onUserUpdated={u => setUser(u)}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Floating WhatsApp Support Button */}
      <SupportButton />

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={isFundWalletOpen}
        onClose={() => setIsFundWalletOpen(false)}
        onFundingSubmitted={() => {
          refreshUserData();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={loggedInUser => {
          setUser(loggedInUser);
          setWalletBalance(loggedInUser.balance);
          refreshUserData();
        }}
      />

      {/* Customer Footer with Silent 6-Click Admin Access */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-400">
            <span
              id="admin-secret-trigger"
              onClick={handleAdminSecretClick}
              className="cursor-pointer select-none hover:text-slate-300 font-medium transition-colors"
            >
              © 2026 Marvel Nums
            </span>{' '}
            Virtual Number Infrastructure. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <button onClick={() => setCurrentTab('buy')} className="hover:text-slate-300">Buy Numbers</button>
            <button onClick={() => setCurrentTab('wallet')} className="hover:text-slate-300">Fund Wallet</button>
            <button onClick={() => setCurrentTab('overview')} className="hover:text-slate-300">Customer Home</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
