import React, { useState } from 'react';
import {
  Clock,
  Search,
  Check,
  Copy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  RefreshCw
} from 'lucide-react';
import { Order } from '../types';
import { resolveCountryFlag } from '../utils/countryData';

interface OrderHistoryViewProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onRefresh
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredOrders = orders.filter(o => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.phoneNumber.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q) ||
        o.countryName.toLowerCase().includes(q) ||
        (o.otpCode && o.otpCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Order History & SMS Archive
          </h1>
          <p className="text-xs text-slate-400">
            Full ledger of past virtual lines, delivered verification codes, and refunds
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Records</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'COMPLETED', 'WAITING_SMS', 'CANCELLED', 'EXPIRED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f === 'ALL' ? 'All Orders' : f === 'WAITING_SMS' ? 'Waiting' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search number, service, OTP..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Order Cards */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
          No orders match the filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Service & Phone */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700">
                      {order.serviceName}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                      <span>{resolveCountryFlag(order.countryName, order.countryId)}</span>
                      <span>{order.countryName}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'WAITING_SMS'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : order.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {order.status === 'WAITING_SMS' ? 'Waiting SMS' : order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold font-mono text-white tracking-wide">
                      {order.phoneNumber}
                    </span>
                    <button
                      onClick={() => copyText(order.phoneNumber, `num-${order.id}`)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedKey === `num-${order.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Ordered: {new Date(order.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Cost: ₦{order.customerPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Right: OTP Code & Status */}
                <div className="flex items-center gap-4">
                  {order.otpCode ? (
                    <div className="flex items-center gap-3 p-2 pl-3.5 rounded-xl bg-slate-950 border border-emerald-500/40">
                      <div>
                        <div className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider">SMS Code</div>
                        <div className="text-lg font-black font-mono text-emerald-400 tracking-wider">
                          {order.otpCode}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(order.otpCode!, `otp-${order.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 transition-all"
                      >
                        {copiedKey === `otp-${order.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-slate-950" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-950" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : order.refunded ? (
                    <div className="text-right">
                      <div className="text-xs font-bold text-teal-400 flex items-center justify-end gap-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refunded ₦{order.refundAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {order.status === 'EXPIRED' ? 'Timeout (No SMS)' : 'Customer Cancelled'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Line Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
