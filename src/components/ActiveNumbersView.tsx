import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Zap,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../api/client';
import { resolveCountryFlag } from '../utils/countryData';

interface ActiveNumbersViewProps {
  orders: Order[];
  onRefresh: () => void;
  onNavigateBuy: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export const ActiveNumbersView: React.FC<ActiveNumbersViewProps> = ({
  orders,
  onRefresh,
  onNavigateBuy,
  onBalanceUpdated
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Ticking timer for real-time countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter only active orders
  const activeOrders = orders.filter(o => o.status === 'WAITING_SMS');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromptCancel = (order: Order) => {
    if (order.otpCode) {
      setActionMsg({
        type: 'error',
        text: 'Cannot cancel order: Your verification SMS code has already been received!'
      });
      return;
    }
    setOrderToCancel(order);
  };

  const handleExecuteCancel = async () => {
    if (!orderToCancel) return;
    const target = orderToCancel;
    setOrderToCancel(null);

    try {
      setCancellingId(target.id);
      setActionMsg(null);
      const res = await api.cancelOrder(target.id);
      if (res.success) {
        setActionMsg({
          type: 'success',
          text: `Line cancelled! ₦${target.customerPrice.toLocaleString()} has been refunded to your wallet.`
        });
        if (onBalanceUpdated && res.newBalance !== undefined) {
          onBalanceUpdated(res.newBalance);
        }
        onRefresh();
      } else {
        setActionMsg({
          type: 'error',
          text: res.message || 'Failed to cancel line. Please try again.'
        });
      }
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err.message || 'Failed to cancel line. Please try again or wait for timeout.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Live Phone Lines & Verification Codes
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time OTP listener • 15-minute countdown window • Automatic refund if no SMS arrives
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={onNavigateBuy}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            + Buy Another Line
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* Active Orders List */}
      {activeOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-white">No Active Phone Lines Right Now</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you purchase a virtual number, it appears here instantly with a 15-minute countdown and live OTP capture.
            </p>
          </div>
          <button
            onClick={onNavigateBuy}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <span>Browse Services & Buy Number</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeOrders.map(order => {
            // Calculate remaining countdown
            const timeLeftMs = Math.max(0, order.expiresAt - now);
            const totalDurationMs = 15 * 60 * 1000;
            const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / totalDurationMs) * 100));

            const minutes = Math.floor(timeLeftMs / 60000);
            const seconds = Math.floor((timeLeftMs % 60000) / 1000);
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            const isExpired = timeLeftMs <= 0;
            const hasOtp = Boolean(order.otpCode);

            return (
              <div
                key={order.id}
                id={`active-order-${order.id}`}
                className={`p-6 rounded-3xl transition-all border relative overflow-hidden shadow-xl ${
                  hasOtp
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Progress bar along top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      hasOtp ? 'bg-emerald-400' : isExpired ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left info: Service & Country */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700">
                        {order.serviceName}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-semibold">
                        <span className="text-base">{resolveCountryFlag(order.countryName, order.countryId)}</span>
                        <span>{order.countryName}</span>
                      </div>
                    </div>

                    {/* Phone Number Display with Copy */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider select-all">
                        {order.phoneNumber}
                      </span>
                      <button
                        id={`copy-number-${order.id}`}
                        onClick={() => copyToClipboard(order.phoneNumber, `num-${order.id}`)}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-all shadow-md"
                        title="Copy phone number"
                      >
                        {copiedId === `num-${order.id}` ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="font-mono">Ref: #{order.providerOrderId}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-400">₦{order.customerPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Middle: Live Status & OTP / Countdown */}
                  <div className="lg:col-span-5 space-y-3">
                    {hasOtp ? (
                      /* OTP RECEIVED HERO */
                      <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 space-y-2 animate-in zoom-in-95">
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            Verification Code Received!
                          </span>
                          <span className="text-[10px] text-emerald-400/80">
                            {order.receivedAt ? new Date(order.receivedAt).toLocaleTimeString() : 'Just now'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/40 gap-3">
                          <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-widest select-all">
                            {order.otpCode}
                          </span>
                          <button
                            id={`copy-otp-${order.id}`}
                            onClick={() => copyToClipboard(order.otpCode!, `otp-${order.id}`)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                          >
                            {copiedId === `otp-${order.id}` ? (
                              <>
                                <Check className="w-4 h-4 text-slate-950" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-slate-950" />
                                <span>Copy OTP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : isExpired ? (
                      /* EXPIRED NOTIFICATION */
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>15-Minute Window Expired</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          The 15-minute countdown elapsed without cancellation. As per policy, numbers not cancelled within 15 minutes are not refunded.
                        </p>
                      </div>
                    ) : (
                      /* WAITING FOR SMS */
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-xs font-bold text-amber-400">Waiting for SMS code...</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Listening for incoming SMS. Code will appear here instantly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:col-span-3 flex flex-col items-end justify-center space-y-2">
                    {hasOtp ? (
                      <div className="text-right space-y-1 w-full bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                        <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span>Code Detected • Line Locked</span>
                        </span>
                        <p className="text-[10px] text-slate-400">
                          As per policy, once SMS code is detected, the number cannot be cancelled.
                        </p>
                      </div>
                    ) : isExpired ? (
                      <div className="text-right space-y-1 w-full p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-xs font-bold text-slate-400">Session Closed</span>
                        <p className="text-[10px] text-slate-500">15-minute window elapsed</p>
                      </div>
                    ) : (
                      <div className="w-full space-y-1.5 text-right">
                        <button
                          id={`cancel-order-btn-${order.id}`}
                          onClick={() => handlePromptCancel(order)}
                          disabled={cancellingId === order.id}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {cancellingId === order.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Cancelling line & refunding...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Cancel & Refund</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-slate-500 text-center">
                          Full ₦{order.customerPrice.toLocaleString()} returned to your wallet immediately
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION & REFUND CONFIRMATION MODAL */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Cancel & Refund Line</h3>
                <p className="text-xs text-slate-400">Immediate wallet refund guarantee</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Number:</span>
                <span className="font-mono font-bold text-white text-sm">{orderToCancel.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Service / Country:</span>
                <span className="text-emerald-400 font-semibold">{orderToCancel.serviceName} ({orderToCancel.countryName})</span>
              </div>
              <div className="h-px bg-slate-800 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Refund Amount:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  +₦{orderToCancel.customerPrice.toLocaleString('en-NG')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Are you sure you want to cancel? The line will be released immediately and ₦{orderToCancel.customerPrice.toLocaleString()} will be credited back to your wallet.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Keep Line
              </button>
              <button
                id="confirm-modal-cancel-refund-btn"
                type="button"
                onClick={handleExecuteCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
