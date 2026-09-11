import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Radio,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Copy,
  Check,
  ExternalLink,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import { ServerOption, Country, ServiceItem, User, Order } from '../types';
import { resolveCountryFlag, resolveCountryDialCode } from '../utils/countryData';

interface BuyNumberViewProps {
  user: User | null;
  walletBalance: number;
  onOpenFundWallet: () => void;
  onOpenAuth: () => void;
  onOrderCompleted: () => void;
}

export const BuyNumberView: React.FC<BuyNumberViewProps> = ({
  user,
  walletBalance,
  onOpenFundWallet,
  onOpenAuth,
  onOrderCompleted
}) => {
  const [servers, setServers] = useState<ServerOption[]>([]);
  const [selectedServer, setSelectedServer] = useState<'server1' | 'server2' | 'server3'>('server1');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearch, setCountrySearch] = useState('');

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');

  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Purchased order modal state for instant copy and viewing
  const [purchasedOrder, setPurchasedOrder] = useState<Order | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // 1. Load available servers
  useEffect(() => {
    async function loadServers() {
      try {
        setLoadingServers(true);
        const res = await api.getServers();
        setServers(res.servers);
        if (res.servers.length > 0) {
          const defaultServer = res.servers[0].id;
          setSelectedServer(defaultServer);
        }
      } catch (err) {
        console.error('Failed to load servers:', err);
      } finally {
        setLoadingServers(false);
      }
    }
    loadServers();
  }, []);

  // 2. Load countries when server changes
  useEffect(() => {
    async function loadCountries() {
      if (!selectedServer) return;
      try {
        setLoadingCountries(true);
        setErrorMsg(null);
        const res = await api.getCountries(selectedServer);
        
        // Enrich countries with proper flags
        const enrichedCountries = res.countries.map(c => ({
          ...c,
          flag: c.flag && c.flag !== '🌐' ? c.flag : resolveCountryFlag(c.name, c.code),
          dialCode: c.dialCode || resolveCountryDialCode(c.name)
        }));
        
        setCountries(enrichedCountries);
        if (enrichedCountries.length > 0) {
          setSelectedCountry(enrichedCountries[0]);
        } else {
          setSelectedCountry(null);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load countries for this server');
      } finally {
        setLoadingCountries(false);
      }
    }
    loadCountries();
  }, [selectedServer]);

  // 3. Load services when country or server changes
  useEffect(() => {
    async function loadServices() {
      if (!selectedServer || !selectedCountry) return;
      try {
        setLoadingServices(true);
        setErrorMsg(null);
        const res = await api.getServices(selectedServer, selectedCountry.id);
        setServices(res.services);
        if (res.services.length > 0) {
          setSelectedService(prev => {
            if (prev) {
              const match = res.services.find(s => s.code === prev.code);
              if (match) return match;
            }
            return res.services[0];
          });
        } else {
          setSelectedService(null);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load services for this line');
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, [selectedServer, selectedCountry]);

  // Filter countries
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Filter services
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Handle Buy Number directly from carrier gateway
  const handleBuyNumber = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!selectedServer || !selectedCountry || !selectedService) {
      setErrorMsg('Please select a server, country, and service.');
      return;
    }

    if (walletBalance < selectedService.customerPrice) {
      setErrorMsg(`Insufficient wallet balance. Line costs ₦${selectedService.customerPrice.toLocaleString()}, but your balance is ₦${walletBalance.toLocaleString()}. Please fund your wallet.`);
      return;
    }

    try {
      setPurchasing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await api.buyNumber({
        serverId: selectedServer,
        countryId: selectedCountry.id,
        countryName: selectedCountry.name,
        serviceCode: selectedService.code,
        serviceName: selectedService.name
      });

      if (res.success && res.order) {
        setPurchasedOrder(res.order);
        setSuccessMsg(`Allocated Number: ${res.order.phoneNumber}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Carrier allocation failed. No funds were charged.');
    } finally {
      setPurchasing(false);
    }
  };

  const copyNumberToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleContinueToActive = () => {
    setPurchasedOrder(null);
    onOrderCompleted();
  };

  // Get server-specific flag preview
  const getServerFlag = (serverId: string) => {
    if (serverId === 'server1') return '🇺🇸';
    if (serverId === 'server2') return '🌍';
    return '⚡';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Direct Carrier Real-Time Dispatch • Zero Latency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Provision Instant Virtual Numbers
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Choose your server route, country, and service. Numbers are allocated directly with a live 15-minute countdown, real-time OTP display, and automatic refunds on cancellation.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">×</button>
        </div>
      )}

      {/* SUCCESS MODAL / NUMBER DISPLAY FOR INSTANT COPY */}
      {purchasedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Number Ready to Use!</h2>
              <p className="text-xs text-slate-400">
                Line activated successfully. Copy this number to paste into {purchasedOrder.serviceName}.
              </p>
            </div>

            {/* Huge Phone Number Card with Copy Button */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{resolveCountryFlag(purchasedOrder.countryName, purchasedOrder.countryId)}</span>
                  <span className="font-semibold text-white">{purchasedOrder.countryName}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{purchasedOrder.serviceName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Ref: #{purchasedOrder.providerOrderId}</span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-wider select-all truncate">
                  {purchasedOrder.phoneNumber}
                </span>
                <button
                  id="copy-allocated-number-btn"
                  onClick={() => copyNumberToClipboard(purchasedOrder.phoneNumber)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* Policy reminders */}
              <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>15-Minute Countdown Active</span>
                </div>
                <p className="leading-relaxed text-slate-400">
                  • As soon as the verification SMS is received by the carrier, your code will show instantly here.
                  <br />
                  • If you cancel before the code arrives or before 15 minutes expire, your wallet will be refunded immediately and the line released.
                  <br />
                  • If not cancelled within 15 minutes or once a code is received, the line cannot be cancelled.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinueToActive}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Go to Live OTP Monitor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SERVER SELECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold font-mono">1</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Select Line Server</h2>
          </div>
          <span className="text-xs text-slate-400">Direct Carrier Gateways</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {servers.map(server => {
            const isSelected = selectedServer === server.id;
            return (
              <button
                key={server.id}
                id={`server-card-${server.id}`}
                onClick={() => setSelectedServer(server.id)}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden border ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getServerFlag(server.id)}</span>
                    <span className="text-xs font-bold text-white">{server.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {server.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{server.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <Radio className={`w-3.5 h-3.5 ${isSelected ? 'fill-emerald-400' : ''}`} />
                  <span>{isSelected ? 'Route Active' : 'Select Server'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2 & 3: COUNTRY AND SERVICE SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Country Selector (Left column) with flags */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold font-mono">2</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Country</h3>
            </div>
            {selectedServer === 'server1' ? (
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                🇺🇸 USA Dedicated
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                {filteredCountries.length} countries
              </span>
            )}
          </div>

          {selectedServer !== 'server1' && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search country or code (US, GB, NG)..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2 max-h-72 overflow-y-auto space-y-1">
            {loadingCountries ? (
              <div className="text-center py-8 text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading country routes...</span>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No countries found</div>
            ) : (
              filteredCountries.map(c => {
                const isSelected = selectedCountry?.id === c.id;
                const flagEmoji = c.flag && c.flag !== '🌐' ? c.flag : resolveCountryFlag(c.name, c.code);
                return (
                  <button
                    key={c.id}
                    id={`country-opt-${c.id}`}
                    onClick={() => setSelectedCountry(c)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl shrink-0" role="img" aria-label={c.name}>
                        {flagEmoji}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {c.dialCode && (
                      <span className="font-mono text-slate-400 text-[11px] shrink-0 ml-2">
                        {c.dialCode}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Service Selector & Checkout (Right column) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold font-mono">3</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Choose Service</h3>
            </div>
            <span className="text-xs text-slate-400">{filteredServices.length} services ready</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={serviceSearch}
              onChange={e => setServiceSearch(e.target.value)}
              placeholder="Search WhatsApp, Telegram, Google, Instagram, OpenAI..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2 max-h-72 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
            {loadingServices ? (
              <div className="col-span-2 text-center py-10 text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Synchronizing live carrier rates...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-xs text-slate-500">No services matching search</div>
            ) : (
              filteredServices.map(s => {
                const isSelected = selectedService?.code === s.code;
                return (
                  <button
                    key={s.code}
                    id={`service-card-${s.code}`}
                    onClick={() => setSelectedService(s)}
                    className={`flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">{s.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          <span>In Stock</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        ₦{s.customerPrice.toLocaleString('en-NG')}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        per OTP
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Checkout Bar */}
          {selectedService && selectedCountry && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl">
                    {selectedCountry.flag && selectedCountry.flag !== '🌐'
                      ? selectedCountry.flag
                      : resolveCountryFlag(selectedCountry.name, selectedCountry.code)}
                  </span>
                  <span className="font-semibold text-white">{selectedCountry.name}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{selectedService.name}</span>
                </div>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-xs text-slate-400">Total Price:</span>
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ₦{selectedService.customerPrice.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">(15-min countdown window)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user && walletBalance < selectedService.customerPrice ? (
                  <button
                    onClick={onOpenFundWallet}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
                  >
                    + Fund Wallet to Purchase
                  </button>
                ) : (
                  <button
                    id="confirm-buy-number-btn"
                    onClick={handleBuyNumber}
                    disabled={purchasing}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Securing Line with Carrier...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Instant Number</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

