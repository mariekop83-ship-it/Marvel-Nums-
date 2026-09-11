import React, { useState } from 'react';
import {
  Wallet,
  PhoneCall,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Globe,
  Lock,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Headphones,
  Flame,
  Layers,
  Shield,
  Activity,
  Server
} from 'lucide-react';
import { User, Order, Transaction } from '../types';

interface OverviewViewProps {
  user: User | null;
  walletBalance: number;
  orders: Order[];
  transactions: Transaction[];
  onOpenFundWallet: () => void;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onAdminSecretClick: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  walletBalance,
  orders,
  transactions,
  onOpenFundWallet,
  onNavigate,
  onOpenAuth,
  onAdminSecretClick
}) => {
  const activeOrders = orders.filter(o => o.status === 'WAITING_SMS');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const [copiedDemo, setCopiedDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const handleCopyDemoCode = () => {
    navigator.clipboard.writeText('849-210');
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  const popularServices = [
    { id: 'wa', name: 'WhatsApp', icon: '🟢', price: '₦180 - ₦450', category: 'social', popular: true, speed: '2.8s' },
    { id: 'tg', name: 'Telegram', icon: '✈️', price: '₦150 - ₦380', category: 'social', popular: true, speed: '3.1s' },
    { id: 'go', name: 'Google / Gmail', icon: '🔍', price: '₦220 - ₦480', category: 'email', popular: true, speed: '4.5s' },
    { id: 'oa', name: 'OpenAI / ChatGPT', icon: '🤖', price: '₦190 - ₦420', category: 'tech', popular: true, speed: '3.4s' },
    { id: 'ig', name: 'Instagram', icon: '📸', price: '₦170 - ₦360', category: 'social', popular: false, speed: '3.9s' },
    { id: 'tk', name: 'TikTok', icon: '🎵', price: '₦160 - ₦350', category: 'social', popular: false, speed: '4.1s' },
    { id: 'tw', name: 'Twitter / X', icon: '𝕏', price: '₦190 - ₦390', category: 'social', popular: false, speed: '3.6s' },
    { id: 'fb', name: 'Facebook', icon: '👤', price: '₦180 - ₦370', category: 'social', popular: false, speed: '4.0s' },
    { id: 'ds', name: 'Discord', icon: '💬', price: '₦175 - ₦380', category: 'gaming', popular: false, speed: '3.5s' },
    { id: 'st', name: 'Steam', icon: '🎮', price: '₦195 - ₦420', category: 'gaming', popular: false, speed: '4.8s' },
    { id: 'nf', name: 'Netflix', icon: '🎬', price: '₦210 - ₦440', category: 'tech', popular: false, speed: '5.2s' },
    { id: 'cl', name: 'Claude / Anthropic', icon: '🧠', price: '₦220 - ₦450', category: 'tech', popular: true, speed: '3.3s' }
  ];

  const filteredServices = serviceFilter === 'all'
    ? popularServices
    : serviceFilter === 'popular'
    ? popularServices.filter(s => s.popular)
    : popularServices.filter(s => s.category === serviceFilter);

  const faqs = [
    {
      q: 'How fast do verification codes arrive?',
      a: 'Through our direct high-throughput carrier gateways, over 94% of SMS verification codes land in your dashboard within 3 to 10 seconds after being requested.'
    },
    {
      q: 'What happens if no OTP arrives before the 15-minute countdown ends?',
      a: 'Zero risk guarantee. If no SMS arrives or if you cancel the number, 100% of your funds are automatically and instantly refunded back to your SteveLogs wallet balance.'
    },
    {
      q: 'Which countries and carriers are supported?',
      a: 'We provide dedicated mobile lines across USA (+1), United Kingdom (+44), Nigeria (+234), Canada (+1), and more than 150 countries worldwide across multiple redundant server routes.'
    },
    {
      q: 'How do I fund my wallet with Nigerian Naira (₦)?',
      a: 'Click on "+ Fund Wallet" to select your preferred bank account or instant payment method. Transfer the desired amount, enter your transaction reference or receipt, and your balance is credited swiftly.'
    },
    {
      q: 'Can I purchase multiple numbers at once?',
      a: 'Yes! You can provision multiple virtual lines concurrently across different services and monitor all incoming codes on your real-time Active Numbers dashboard.'
    }
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Carrier Gateways Active • 99.8% Delivery Rate</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Instant Virtual Numbers & <span className="text-emerald-400">Real-Time OTP</span> Verification
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Provision high-speed dedicated lines for WhatsApp, Telegram, Google, ChatGPT, and 500+ platforms. Features live 15-minute countdowns, instantaneous SMS receipt, and guaranteed automated wallet refunds.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-provision-btn"
                onClick={() => (user ? onNavigate('buy') : onOpenAuth())}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Provision Number Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="hero-fund-btn"
                onClick={() => (user ? onOpenFundWallet() : onOpenAuth())}
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 hover:border-emerald-500/40"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>+ Fund Wallet (₦)</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Auto-Refund</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-5s Code Arrival</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>150+ Global Codes</span>
              </div>
            </div>
          </div>

          {/* Right Hero Live Interactive Demo Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Gateway Monitor</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  ROUTE: SERVER 1 (USA)
                </span>
              </div>

              {/* Virtual Number Mockup */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Service:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>🟢</span> WhatsApp Messenger
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black font-mono text-white tracking-wide">
                    +1 (646) 882-9411
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    ⏱ 14:38 left
                  </span>
                </div>
              </div>

              {/* Simulated Code Pop Box */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SMS Received Just Now
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Speed: 3.2s</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/90 rounded-lg p-2.5 border border-emerald-500/30">
                  <div>
                    <div className="text-[10px] text-slate-500">Your WhatsApp code is:</div>
                    <div className="text-lg font-black font-mono text-emerald-300 tracking-wider">
                      849-210
                    </div>
                  </div>
                  <button
                    onClick={handleCopyDemoCode}
                    className="px-3 py-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedDemo ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Auto-refund activated if no SMS</span>
                <span className="text-emerald-400 font-semibold">100% Guaranteed</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. USER DASHBOARD METRICS (Shows when logged in, or quick summary) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {user ? `Account Overview: ${user.name}` : 'Platform Performance & Real-Time Stats'}
          </h2>
          {user && (
            <button
              onClick={() => onNavigate('wallet')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Balance or Delivery Speed */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{user ? 'Wallet Balance' : 'Average Speed'}</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              {user ? `₦${walletBalance.toLocaleString('en-NG')}` : '< 5.0 Sec'}
            </div>
            {user ? (
              <button
                onClick={onOpenFundWallet}
                className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>+ Deposit funds</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <p className="text-[11px] text-slate-500">Carrier API direct link</p>
            )}
          </div>

          {/* Card 2: Active Lines */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{user ? 'Active Lines' : 'Refund Policy'}</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              {user ? activeOrders.length : '100% Refund'}
            </div>
            {user ? (
              <button
                onClick={() => onNavigate('my-numbers')}
                className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Waiting for OTP</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <p className="text-[11px] text-slate-500">15-Minute auto-reimburse</p>
            )}
          </div>

          {/* Card 3: Delivered Codes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{user ? 'Delivered Codes' : 'Global Coverage'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              {user ? completedOrders.length : '150+ Nations'}
            </div>
            <p className="text-[11px] text-slate-500">USA, UK, Nigeria & more</p>
          </div>

          {/* Card 4: Total Orders or Multi-Server */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">{user ? 'Total Orders' : 'Route Redundancy'}</span>
              <Server className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
              {user ? orders.length : '3 Server Nodes'}
            </div>
            {user ? (
              <button
                onClick={() => onNavigate('orders')}
                className="text-[11px] font-bold text-slate-400 hover:underline flex items-center gap-1"
              >
                <span>View order history</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <p className="text-[11px] text-slate-500">Zero downtime routing</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. POPULAR VERIFICATION SERVICES MATRIX */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Supported Platforms & Live Pricing
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Select any service to instantly browse available carrier routes and provision numbers.
            </p>
          </div>

          {/* Service Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {['all', 'popular', 'social', 'tech', 'gaming'].map(f => (
              <button
                key={f}
                onClick={() => setServiceFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all whitespace-nowrap ${
                  serviceFilter === f
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredServices.map(service => (
            <button
              key={service.id}
              onClick={() => onNavigate('buy')}
              className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    ⚡ {service.speed}
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {service.name}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="font-mono text-emerald-400 font-bold">{service.price}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
                  Get Line →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('buy')}
            className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <span>Browse All 500+ Verification Services</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* 4. WHY STEVELOGS / CORE ADVANTAGES */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Why Professionals Choose SteveLogs
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built from the ground up for high deliverability, developer speed, and financial peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Direct Carrier Low Latency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We connect directly to mobile network operators. When an SMS is sent, it hits our servers and reflects on your screen in seconds without reload.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Guaranteed Auto Refund</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never pay for a line that didn't receive an OTP. If no verification code lands within 15 minutes, your wallet is 100% refunded automatically.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3 Redundant Server Routes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from Server 1 (USA Ultra Speed), Server 2 (Global 150+ Countries), and Server 3 (High Capacity) to guarantee continuous availability.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS IN 3 SIMPLE STEPS */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              How SteveLogs Works in 3 Steps
            </h2>
            <p className="text-xs text-slate-400">Get your verification code ready in under 60 seconds.</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
            Zero Complexity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Up Balance</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-11">
              Fund your wallet using fast Nigerian Naira (₦) bank transfer. Your account is credited with instant balance ready for purchase.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pick Service & Route</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-11">
              Select WhatsApp, Telegram, Google, or any platform. Choose your preferred country code and route, then click Buy.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Receive Code & Verify</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-11">
              Copy the provisioned phone number into the app. Your OTP code arrives on screen in seconds with a 1-click copy button.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950/70 border border-slate-800/80 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Ready to verify your accounts with zero hassle?
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Join thousands of developers, agencies, and digital creators who rely on SteveLogs for real-time OTP delivery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => (user ? onNavigate('buy') : onOpenAuth())}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Provision First Line</span>
          </button>
          <button
            onClick={() => (user ? onOpenFundWallet() : onOpenAuth())}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            + Fund Wallet (₦)
          </button>
        </div>
      </section>

      {/* 8. HOME PAGE BRANDING & SILENT ADMIN ACCESS TRIGGER */}
      <section className="pt-4 text-center border-t border-slate-900">
        <p className="text-xs text-slate-500">
          <span
            id="home-admin-secret-trigger"
            onClick={onAdminSecretClick}
            className="cursor-pointer select-none text-slate-400 hover:text-slate-300 transition-colors"
          >
            © 2026 SteveLogs
          </span>{' '}
          Virtual Number & SMS Infrastructure. High-availability routing powered by direct carrier gateways.
        </p>
      </section>

    </div>
  );
};
