import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { Transaction, FundingRequest } from '../types';
import { api } from '../api/client';

interface WalletViewProps {
  balance: number;
  onOpenFundWallet: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  balance,
  onOpenFundWallet
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'deposits'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundRequests, setFundRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeSubTab === 'transactions') {
        const res = await api.getTransactions();
        setTransactions(res.transactions);
      } else {
        const res = await api.getMyFundRequests();
        setFundRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Available Wallet Balance</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
              ₦{balance.toLocaleString('en-NG')}
            </div>
            <p className="text-xs text-slate-400">
              Instant balance for line allocations and OTP verifications
            </p>
          </div>

          <div>
            <button
              id="wallet-view-fund-btn"
              onClick={onOpenFundWallet}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Deposit / Fund Wallet</span>
            </button>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'transactions'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transaction Ledger
          </button>
          <button
            onClick={() => setActiveSubTab('deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'deposits'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit Requests History
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Synchronizing records...</span>
        </div>
      ) : activeSubTab === 'transactions' ? (
        transactions.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
            No transactions found yet. Fund your wallet or purchase a number.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => {
              const isCredit = tx.type === 'DEPOSIT' || tx.type === 'REFUND' || (tx.type === 'ADMIN_ADJUSTMENT' && tx.amount > 0);
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.type === 'REFUND'
                          ? 'bg-teal-500/20 text-teal-400'
                          : tx.type === 'PURCHASE'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-5 h-5" />}
                      {tx.type === 'REFUND' && <RotateCcw className="w-4 h-4" />}
                      {tx.type === 'PURCHASE' && <ArrowUpRight className="w-5 h-5" />}
                      {tx.type === 'ADMIN_ADJUSTMENT' && <Wallet className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()} • ID: {tx.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString('en-NG')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Bal: ₦{tx.balanceAfter.toLocaleString('en-NG')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* DEPOSIT REQUESTS */
        fundRequests.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
            No deposit requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {fundRequests.map(fr => (
              <div
                key={fr.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{fr.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fr.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : fr.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {fr.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Channel: {fr.paymentMethodName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Submitted: {new Date(fr.createdAt).toLocaleString()}
                  </div>
                  {fr.rejectReason && (
                    <div className="text-[11px] text-rose-300 font-medium">
                      Reason: {fr.rejectReason}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-base font-extrabold font-mono text-white">
                    ₦{fr.amount.toLocaleString('en-NG')}
                  </div>
                  {fr.status === 'APPROVED' ? (
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Credited to Wallet</span>
                    </div>
                  ) : fr.status === 'PENDING' ? (
                    <div className="text-[10px] text-amber-400 font-medium flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Under Verification</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-rose-400 font-medium flex items-center sm:justify-end gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Declined</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
