import React, { useState } from 'react';
import {
  PhoneCall,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Server,
  Layers,
  Star,
  Activity,
  UserCheck
} from 'lucide-react';

interface LandingPageViewProps {
  onOpenAuth: () => void;
  onAdminSecretClick: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenAuth,
  onAdminSecretClick
}) => {
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
      a: 'Zero risk guarantee. If no SMS arrives or if you cancel the line, 100% of your funds are automatically and instantly refunded back to your Marvel Nums wallet balance.'
    },
    {
      q: 'Which countries and carriers are supported?',
      a: 'We provide dedicated mobile lines across USA (+1), United Kingdom (+44), Nigeria (+234), Canada (+1), and more than 150 countries worldwide across multiple redundant server routes.'
    },
    {
      q: 'How do I fund my wallet with Nigerian Naira (₦)?',
      a: 'We support instant bank transfers (OPay, PalmPay, Moniepoint, Kuda, Commercial Banks) and USDT crypto. Top-ups are verified quickly by our automated ledger.'
    },
    {
      q: 'Can numbers be reused by other people?',
      a: 'No. Each activation number provided through Marvel Nums is an exclusive temporary session dedicated to your verification task.'
    }
  ];

  return (
    <div className="space-y-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-12 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Carrier Gateways Active • 99.8% SMS Delivery Rate</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Instant Virtual Numbers & <span className="text-emerald-400">Real-Time OTP</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Provision high-speed dedicated phone numbers for WhatsApp, Telegram, Google, ChatGPT, and 500+ services. Enjoy live 15-minute timers, instant SMS receipt, and 100% automated refunds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="landing-hero-signup-btn"
                onClick={onOpenAuth}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="landing-hero-signin-btn"
                onClick={onOpenAuth}
                className="px-6 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-bold transition-all flex items-center gap-2 hover:border-emerald-500/40"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign In to Account</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Auto-Refund</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-5s Code Arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>150+ Global Codes</span>
              </div>
            </div>
          </div>

          {/* Right Hero Live Interactive Demo Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm space-y-4">
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
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Platform:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span>🟢</span> WhatsApp Messenger
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black font-mono text-white tracking-wide">
                    +1 (646) 882-9411
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    ⏱ 14:38 left
                  </span>
                </div>
              </div>

              {/* Simulated Code Pop Box */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    SMS Received Just Now
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Speed: 3.2s</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/90 rounded-lg p-3 border border-emerald-500/30">
                  <div>
                    <div className="text-[10px] text-slate-500">Your WhatsApp code is:</div>
                    <div className="text-xl font-black font-mono text-emerald-300 tracking-wider">
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

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Auto-refund activated if no SMS</span>
                <span className="text-emerald-400 font-semibold">100% Guaranteed</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PLATFORM SPEED & NETWORK METRICS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Carrier Speed</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center gap-1">
            <span>&lt; 5s</span>
            <span className="text-xs text-emerald-400 font-normal">avg</span>
          </div>
          <p className="text-[11px] text-slate-500">Direct telecom API links</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Refund Assurance</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</div>
          <p className="text-[11px] text-slate-500">Instant wallet reversal</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Global Coverage</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">150+</div>
          <p className="text-[11px] text-slate-500">USA, UK, NG, CA & more</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Server Routes</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">3 Nodes</div>
          <p className="text-[11px] text-slate-500">Redundant fallback</p>
        </div>
      </section>

      {/* 3. SUPPORTED PLATFORMS & LIVE PRICING PREVIEWS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Supported Services & Direct Carrier Pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Sign in to your account to provision real numbers for any platform below.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'popular', label: '🔥 Top Picks' },
              { id: 'social', label: 'Social' },
              { id: 'tech', label: 'AI & Tech' },
              { id: 'gaming', label: 'Gaming' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setServiceFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  serviceFilter === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredServices.map(srv => (
            <div
              key={srv.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-3 group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{srv.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {srv.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">⚡ {srv.speed} delivery</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Est. Rate</span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">{srv.price}</span>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Get Line</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY MARVEL NUMS / CORE ADVANTAGES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Professionals Choose Marvel Nums
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered for reliability, instant API response, and zero financial risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sub-5s Direct Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We connect straight to upstream telecom carrier aggregators, bypassing slow web scrapers and middleman delays so your OTP lands in seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">15-Minute Auto-Refund</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an SMS does not arrive before the 15-minute countdown elapses, our system automatically releases the line and refunds 100% of your money.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3 Redundant Server Routes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch effortlessly between Server 1 (Global), Server 2 (High-Speed), and Server 3 (Budget) to ensure maximum line availability around the clock.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 3-STEP ONBOARDING */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Simple Workflow</span>
          <h2 className="text-2xl font-extrabold text-white">
            How Marvel Nums Works in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-emerald-500/20">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Create Account & Top Up</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign up in 10 seconds and deposit funds using instant bank transfer (OPay, PalmPay, Moniepoint) or crypto USDT.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-emerald-500/20">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Pick Country & Platform</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your desired service (WhatsApp, Telegram, ChatGPT, etc.) and country. Click purchase to reserve your line immediately.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-emerald-500/20">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Receive SMS & Verify</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the phone number into the app. Watch your verification code pop up on your screen with a 1-click copy button.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">Everything you need to know about our virtual numbers and refund guarantee.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-white hover:text-emerald-400"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Verify Any Platform Instantly?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Join thousands of developers, agencies, and digital creators who rely on Marvel Nums for real-time OTP delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-slate-200 border border-slate-700 text-sm font-bold"
          >
            Sign In
          </button>
        </div>
      </section>

    </div>
  );
};
