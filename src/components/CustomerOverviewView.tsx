import React from 'react';
import {
  Wallet,
  PhoneCall,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Plus
} from 'lucide-react';
import { User, Order, Transaction } from '../types';

interface CustomerOverviewViewProps {
  user: User;
  walletBalance: number;
  orders: Order[];
  transactions: Transaction[];
  onOpenFundWallet: () => void;
  onNavigate: (tab: string) => void;
}

export const CustomerOverviewView: React.FC<CustomerOverviewViewProps> = ({
  user,
  walletBalance,
  orders,
  transactions,
  onOpenFundWallet,
  onNavigate
}) => {
  const activeOrders = orders.filter(o => o.status === 'WAITING_SMS');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const refundedOrders = orders.filter(o => o.refunded || o.status === 'CANCELLED' || o.status === 'EXPIRED');

  const popularServices = [
    { name: 'WhatsApp', icon: '🟢', route: 'server1', price: 'from ₦180' },
    { name: 'Telegram', icon: '✈️', route: 'server1', price: 'from ₦150' },
    { name: 'Google / Gmail', icon: '🔍', route: 'server1', price: 'from ₦220' },
    { name: 'OpenAI / ChatGPT', icon: '🤖', route: 'server2', price: 'from ₦190' },
    { name: 'Instagram', icon: '📸', route: 'server1', price: 'from ₦170' },
    { name: 'TikTok', icon: '🎵', route: 'server2', price: 'from ₦160' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* 1. WELCOME & ACCOUNT HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Customer Account
            </span>
            <span className="text-xs text-slate-400">ID: {user.id.substring(0, 8)}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user.name}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Manage your virtual phone lines, view incoming SMS verification codes in real-time, and top up your wallet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="overview-buy-btn"
            onClick={() => onNavigate('buy')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Buy Phone Number</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="overview-fund-btn"
            onClick={onOpenFundWallet}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>+ Fund (₦)</span>
          </button>
        </div>
      </div>

      {/* 2. ACCOUNT METRICS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Wallet Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ₦{walletBalance.toLocaleString('en-NG')}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Auto-refund active
            </span>
          </div>
          <button
            onClick={onOpenFundWallet}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-colors"
          >
            + Add Funds
          </button>
        </div>

        {/* Active Lines */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Lines</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              <span>{activeOrders.length}</span>
              {activeOrders.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] text-slate-400">Waiting for incoming SMS</span>
          </div>
          <button
            onClick={() => onNavigate('my-numbers')}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            View Live Lines →
          </button>
        </div>

        {/* Delivered OTPs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Delivered Codes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {completedOrders.length}
            </div>
            <span className="text-[10px] text-slate-400">Successfully verified</span>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Order History →
          </button>
        </div>

        {/* Total Orders / Activity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Lines</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {orders.length}
            </div>
            <span className="text-[10px] text-slate-400">{refundedOrders.length} refunded</span>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Wallet Ledger →
          </button>
        </div>
      </div>

      {/* 3. ACTIVE WAITING LINES BANNER (IF ANY) */}
      {activeOrders.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {activeOrders.length} Active Phone Line(s) Waiting for Verification SMS
              </h3>
            </div>
            <button
              onClick={() => onNavigate('my-numbers')}
              className="text-xs text-amber-400 font-bold hover:underline"
            >
              Open Live Monitor →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeOrders.slice(0, 2).map(order => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-emerald-400 font-bold">{order.serviceName}</div>
                  <div className="text-sm font-mono font-bold text-white">{order.phoneNumber}</div>
                </div>
                <button
                  onClick={() => onNavigate('my-numbers')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                >
                  View Code
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUICK PURCHASE SHORTCUTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Instant Number Activation
            </h2>
            <p className="text-xs text-slate-400">Select a service to provision a dedicated mobile line right away</p>
          </div>
          <button
            onClick={() => onNavigate('buy')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>Browse All 500+ Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularServices.map((srv, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('buy')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition-all group shadow-sm flex flex-col justify-between space-y-3"
            >
              <span className="text-2xl">{srv.icon}</span>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {srv.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-medium">{srv.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. RECENT WALLET & ORDER LEDGER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Recent Transactions & Activity
            </h2>
            <p className="text-xs text-slate-400">Live ledger of purchases, deposits, and automated refunds</p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No transactions recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fund your wallet to begin activating virtual numbers with instant real-time SMS delivery.
              </p>
            </div>
            <button
              onClick={onOpenFundWallet}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              + Fund Your Wallet
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {transactions.slice(0, 5).map(tx => (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tx.type === 'REFUND'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'REFUND' ? '↺' : '↑'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{tx.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono ${
                        tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                          ? 'text-emerald-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Bal: ₦{tx.balanceAfter.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
