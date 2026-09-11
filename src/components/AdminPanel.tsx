import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  Building2,
  Settings,
  Activity,
  Send,
  Headphones,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  Check,
  X,
  Power,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/client';
import { AdminStats, AdminSettings, FundingRequest, Order, User, PaymentMethod, DiagnosticsLog } from '../types';

interface AdminPanelProps {
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'funding' | 'customers' | 'orders' | 'methods' | 'servers' | 'diagnostics' | 'telegram' | 'support' | 'security'
  >('dashboard');

  // State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [customers, setCustomers] = useState<(User & { ordersCount: number; fundingCount: number })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<DiagnosticsLog[]>([]);

  // Modals & Forms
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [adjustCustomer, setAdjustCustomer] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<Partial<PaymentMethod> | null>(null);
  
  // Telegram testing
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramResult, setTelegramResult] = useState<{ success: boolean; message: string } | null>(null);

  // Syncing
  const [syncingProvider, setSyncingProvider] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Password change
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passChangeMsg, setPassChangeMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Notification / Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check saved password on mount
  useEffect(() => {
    const saved = localStorage.getItem('stevelogs_admin_password');
    if (saved) {
      verifyPassword(saved);
    }
  }, []);

  const verifyPassword = async (pass: string) => {
    try {
      setCheckingAuth(true);
      setAuthError(null);
      const res = await api.admin.verifyPassword(pass);
      if (res.success) {
        setAuthenticated(true);
        loadInitialAdminData();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect password.');
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadInitialAdminData = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getSettings()
      ]);
      setStats(statsRes);
      setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Admin data load failed:', err);
    }
  };

  // Load tab-specific data
  useEffect(() => {
    if (!authenticated) return;
    if (adminTab === 'dashboard') {
      api.admin.getDashboard().then(setStats).catch(console.error);
    } else if (adminTab === 'funding') {
      api.admin.getFundingRequests().then(res => setFundingRequests(res.requests)).catch(console.error);
    } else if (adminTab === 'customers') {
      api.admin.getUsers().then(res => setCustomers(res.users)).catch(console.error);
    } else if (adminTab === 'orders') {
      api.admin.getOrders().then(res => setOrders(res.orders)).catch(console.error);
    } else if (adminTab === 'methods') {
      api.admin.getPaymentMethods().then(res => setPaymentMethods(res.paymentMethods)).catch(console.error);
    } else if (adminTab === 'diagnostics') {
      api.admin.getDiagnostics().then(res => {
        setDiagnosticsLogs(res.logs);
      }).catch(console.error);
    }
  }, [adminTab, authenticated]);

  // Handle Approve Funding (Idempotent exactly once!)
  const handleApproveFunding = async (requestId: string) => {
    try {
      setFeedback(null);
      const res = await api.admin.approveFunding(requestId);
      setFeedback({ type: 'success', message: res.message });
      // Reload funding requests and dashboard
      const updated = await api.admin.getFundingRequests();
      setFundingRequests(updated.requests);
      api.admin.getDashboard().then(setStats).catch(console.error);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve funding' });
    }
  };

  // Handle Reject Funding
  const handleRejectFunding = async (requestId: string) => {
    const reason = window.prompt('Enter reason for declining this deposit:', 'Receipt could not be verified or payment not received.');
    if (reason === null) return;

    try {
      setFeedback(null);
      const res = await api.admin.rejectFunding(requestId, reason);
      setFeedback({ type: 'success', message: res.message });
      const updated = await api.admin.getFundingRequests();
      setFundingRequests(updated.requests);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject funding' });
    }
  };

  // Toggle Suspend User
  const handleToggleSuspend = async (userId: string) => {
    try {
      const res = await api.admin.toggleSuspendUser(userId);
      setCustomers(prev => prev.map(c => c.id === userId ? { ...c, isSuspended: res.user.isSuspended } : c));
      setFeedback({ type: 'success', message: `Customer status updated to ${res.user.isSuspended ? 'Suspended' : 'Active'}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status' });
    }
  };

  // Adjust Wallet
  const handleSaveAdjustment = async () => {
    if (!adjustCustomer) return;
    const num = Number(adjustAmount);
    if (isNaN(num) || num === 0) {
      alert('Please enter a valid adjustment amount.');
      return;
    }
    if (!adjustReason.trim()) {
      alert('A reason is mandatory for manual balance adjustments.');
      return;
    }

    try {
      await api.admin.adjustUserWallet(adjustCustomer.id, num, adjustReason);
      setFeedback({ type: 'success', message: `Wallet adjusted for ${adjustCustomer.name}.` });
      setAdjustCustomer(null);
      setAdjustAmount('');
      setAdjustReason('');
      api.admin.getUsers().then(res => setCustomers(res.users)).catch(console.error);
    } catch (err: any) {
      alert(err.message || 'Adjustment failed');
    }
  };

  // Server Toggles
  const handleToggleServer = async (serverKey: 'server1Enabled' | 'server2Enabled' | 'server3Enabled', value: boolean) => {
    try {
      const res = await api.admin.updateSettings({ [serverKey]: value });
      setSettings(res.settings);
      setFeedback({ type: 'success', message: `Server route settings saved. Customer portal updated.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update server' });
    }
  };

  // Provider Sync Now
  const handleSyncNow = async () => {
    try {
      setSyncingProvider(true);
      setSyncResult(null);
      const res = await api.admin.syncNow();
      if (res.success) {
        setSyncResult(`Provider Connected! Balance: ₦${res.balance.toLocaleString()}`);
        api.admin.getDashboard().then(setStats).catch(console.error);
      } else {
        setSyncResult(`Sync Error: ${res.error}`);
      }
    } catch (err: any) {
      setSyncResult(`Connection failed: ${err.message}`);
    } finally {
      setSyncingProvider(false);
    }
  };

  // Test Telegram
  const handleTestTelegram = async () => {
    if (!settings?.telegramBotToken || !settings?.telegramChatId) {
      alert('Please provide both Telegram Bot Token and Chat ID first.');
      return;
    }
    try {
      setTelegramTesting(true);
      setTelegramResult(null);
      const res = await api.admin.testTelegram(settings.telegramBotToken, settings.telegramChatId);
      setTelegramResult(res);
    } catch (err: any) {
      setTelegramResult({ success: false, message: err.message || 'Telegram test error' });
    } finally {
      setTelegramTesting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (partial: Partial<AdminSettings>) => {
    try {
      const res = await api.admin.updateSettings(partial);
      setSettings(res.settings);
      setFeedback({ type: 'success', message: 'Settings saved successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass || newAdminPass.length < 4) {
      setPassChangeMsg({ success: false, text: 'Password must be at least 4 characters.' });
      return;
    }
    try {
      await api.admin.changePassword(newAdminPass);
      setPassChangeMsg({ success: true, text: 'Admin password updated successfully!' });
      setNewAdminPass('');
    } catch (err: any) {
      setPassChangeMsg({ success: false, text: err.message || 'Failed to change password' });
    }
  };

  // Save Payment Method
  const handleSavePaymentMethod = async () => {
    if (!editingPaymentMethod) return;
    try {
      await api.admin.savePaymentMethod(editingPaymentMethod);
      setEditingPaymentMethod(null);
      api.admin.getPaymentMethods().then(res => setPaymentMethods(res.paymentMethods)).catch(console.error);
      setFeedback({ type: 'success', message: 'Payment method saved.' });
    } catch (err: any) {
      alert(err.message || 'Failed to save payment method');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm('Delete this payment method?')) return;
    try {
      await api.admin.deletePaymentMethod(id);
      api.admin.getPaymentMethods().then(res => setPaymentMethods(res.paymentMethods)).catch(console.error);
      setFeedback({ type: 'success', message: 'Payment method removed.' });
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  // IF NOT AUTHENTICATED -> SHOW ADMIN LOCK SCREEN
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Marvel Nums Admin Portal</h1>
            <p className="text-xs text-slate-400">
              Authorized access only. Enter administrative security key to proceed.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              verifyPassword(passwordInput);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={checkingAuth}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {checkingAuth ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Unlock Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <button
              onClick={onExitAdmin}
              className="text-xs text-slate-400 hover:text-white"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                Marvel Nums <span className="text-emerald-400">ADMIN</span>
              </span>
              <span className="text-[10px] text-slate-400 block leading-none">Management Console</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncNow}
            disabled={syncingProvider}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Sync BenOTP balance and rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Provider Sync</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            Storefront View →
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-60 shrink-0 bg-slate-900/50 border-r border-slate-800 p-3 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
            { id: 'funding', label: 'Funding Requests', icon: Wallet, badge: stats?.pendingFundingCount ? `${stats.pendingFundingCount} New` : null },
            { id: 'customers', label: 'Customers & Balances', icon: Users, badge: null },
            { id: 'orders', label: 'All Orders & Codes', icon: Clock, badge: null },
            { id: 'methods', label: 'Payment Methods', icon: Building2, badge: null },
            { id: 'servers', label: 'Server Toggles', icon: Power, badge: null },
            { id: 'diagnostics', label: 'BenOTP & Diagnostics', icon: Activity, badge: null },
            { id: 'telegram', label: 'Telegram Bot Alerts', icon: Send, badge: null },
            { id: 'support', label: 'WhatsApp Desk', icon: Headphones, badge: null },
            { id: 'security', label: 'Change Admin Pass', icon: Key, badge: null },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`w-full shrink-0 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="text-sm font-bold">×</button>
            </div>
          )}

          {/* TAB: DASHBOARD OVERVIEW */}
          {adminTab === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <div>
                  <h2 className="text-xl font-extrabold text-white">System Performance & Provider Metrics</h2>
                  <p className="text-xs text-slate-400">Live operational overview of customer deposits, provider margins, and order fulfillment</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    stats.providerStatus === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    Provider: {stats.providerStatus}
                  </span>
                </div>
              </div>

              {/* Top Financial & Operational Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Deposits Approved</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ₦{stats.walletFundingTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{stats.pendingFundingCount} pending reviews</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Gross Completed Volume</div>
                  <div className="text-2xl font-black font-mono text-white">
                    ₦{stats.grossRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">Est. Markup: ₦{stats.estimatedMarkupProfit.toLocaleString()}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Provider Account Balance</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ₦{stats.providerBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Live on BenOTP Carrier</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Customer Base</div>
                  <div className="text-2xl font-black font-mono text-white">
                    {stats.totalCustomers}
                  </div>
                  <div className="text-[10px] text-slate-500">{stats.activeCustomers} active / unblocked</div>
                </div>
              </div>

              {/* Order Stats Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Active Lines Waiting SMS</div>
                  <div className="text-xl font-bold font-mono text-amber-400">{stats.activeOrders}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Completed OTPs</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{stats.completedOrders}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Cancelled / Expired</div>
                  <div className="text-xl font-bold font-mono text-slate-300">{stats.cancelledOrders}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Refunded to Users</div>
                  <div className="text-xl font-bold font-mono text-teal-400">₦{stats.refundsTotal.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FUNDING REQUESTS (RECEIPT DESK) */}
          {adminTab === 'funding' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Wallet Deposit Verification Desk</h2>
                  <p className="text-xs text-slate-400">Review transfer receipts and credit customer wallets with 1 click</p>
                </div>
                <span className="text-xs text-slate-400">{fundingRequests.length} total deposit records</span>
              </div>

              {fundingRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 rounded-3xl bg-slate-900 border border-slate-800">
                  No funding requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {fundingRequests.map(fr => (
                    <div
                      key={fr.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{fr.id}</span>
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

                        <div className="text-sm font-bold text-white">
                          {fr.customerName} <span className="text-xs text-slate-400 font-normal">({fr.customerEmail})</span>
                        </div>

                        <div className="text-xs text-slate-400">
                          Channel: <span className="text-white font-semibold">{fr.paymentMethodName}</span>
                          {fr.referenceNote && ` • Note: ${fr.referenceNote}`}
                        </div>

                        <div className="text-[10px] text-slate-500">
                          Submitted: {new Date(fr.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3">
                        <div className="text-2xl font-black font-mono text-emerald-400">
                          ₦{fr.amount.toLocaleString('en-NG')}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Receipt View button */}
                          {fr.receiptUrl && (
                            <button
                              onClick={() => setViewReceiptUrl(fr.receiptUrl)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {fr.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveFunding(fr.id)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Credit</span>
                              </button>

                              <button
                                onClick={() => handleRejectFunding(fr.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CUSTOMERS & BALANCES */}
          {adminTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Registered Customer Accounts</h2>
                  <p className="text-xs text-slate-400">Manage user credentials, balances, and suspension</p>
                </div>
                <span className="text-xs text-slate-400">{customers.length} total users</span>
              </div>

              <div className="space-y-2">
                {customers.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{c.name}</span>
                        {c.isSuspended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {c.email} {c.phone && `• ${c.phone}`}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.ordersCount} total orders • Registered: {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Wallet Balance</div>
                        <div className="text-base font-bold font-mono text-emerald-400">
                          ₦{c.balance.toLocaleString('en-NG')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAdjustCustomer(c)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Adjust Balance
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(c.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            c.isSuspended
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {c.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ALL ORDERS */}
          {adminTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Carrier Orders & Live OTP Logs</h2>
                  <p className="text-xs text-slate-400">Full audit log of carrier numbers and SMS responses</p>
                </div>
                <span className="text-xs text-slate-400">{orders.length} orders total</span>
              </div>

              <div className="space-y-2">
                {orders.map(o => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{o.serviceName}</span>
                        <span className="text-xs text-slate-400">({o.countryName})</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{o.providerOrderId}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : o.status === 'WAITING_SMS'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold font-mono text-white">
                        {o.phoneNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Customer: {o.customerName} ({o.customerEmail}) • Date: {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {o.otpCode && (
                        <div className="p-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                          <div className="text-[9px] text-emerald-400 uppercase font-bold">SMS Code</div>
                          <div className="text-base font-black font-mono text-emerald-400">{o.otpCode}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-xs font-bold text-white font-mono">₦{o.customerPrice.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Provider: ₦{o.providerPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT METHODS */}
          {adminTab === 'methods' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Configured Deposit Accounts</h2>
                  <p className="text-xs text-slate-400">Bank and crypto accounts displayed to customers during deposit</p>
                </div>
                <button
                  onClick={() => setEditingPaymentMethod({ title: 'Bank Transfer', type: 'BANK', bankName: '', accountName: '', accountNumber: '', instructions: '', isActive: true })}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  + Add Payment Method
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{pm.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pm.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {pm.isActive ? 'Active on Storefront' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingPaymentMethod(pm)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePaymentMethod(pm.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 space-y-1 text-xs font-mono">
                      <div><span className="text-slate-500">Bank:</span> {pm.bankName}</div>
                      <div><span className="text-slate-500">Account No:</span> <strong className="text-white">{pm.accountNumber}</strong></div>
                      <div><span className="text-slate-500">Account Name:</span> {pm.accountName}</div>
                    </div>

                    {pm.instructions && (
                      <p className="text-[11px] text-slate-400">{pm.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SERVER TOGGLES */}
          {adminTab === 'servers' && settings && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-white">Carrier Server Visibility Toggles</h2>
                <p className="text-xs text-slate-400">
                  Enable or disable individual carrier servers from being displayed to customers. If a server is toggled OFF, customers will not see it on their purchase screen.
                </p>
              </div>

              <div className="space-y-4">
                {/* Server 1 */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Server 1 — USA Instant</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">USA Only (187)</span>
                    </div>
                    <p className="text-xs text-slate-400">Fast dedicated line for United States numbers via handler_api.php</p>
                  </div>
                  <button
                    onClick={() => handleToggleServer('server1Enabled', !settings.server1Enabled)}
                    className="flex items-center gap-2"
                  >
                    {settings.server1Enabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                    <span className={`text-xs font-bold ${settings.server1Enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {settings.server1Enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                {/* Server 2 */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Server 2 — Worldwide Standard</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">All Countries</span>
                    </div>
                    <p className="text-xs text-slate-400">Global line availability across 150+ countries via all_server_2.php</p>
                  </div>
                  <button
                    onClick={() => handleToggleServer('server2Enabled', !settings.server2Enabled)}
                    className="flex items-center gap-2"
                  >
                    {settings.server2Enabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                    <span className={`text-xs font-bold ${settings.server2Enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {settings.server2Enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                {/* Server 3 */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Server 3 — Worldwide High-Capacity</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">All Countries (handler.php)</span>
                    </div>
                    <p className="text-xs text-slate-400">High-capacity global carrier route with automated service code normalization</p>
                  </div>
                  <button
                    onClick={() => handleToggleServer('server3Enabled', !settings.server3Enabled)}
                    className="flex items-center gap-2"
                  >
                    {settings.server3Enabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                    <span className={`text-xs font-bold ${settings.server3Enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {settings.server3Enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BENOTP & DIAGNOSTICS */}
          {adminTab === 'diagnostics' && settings && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-lg font-extrabold text-white">BenOTP API Credentials & Profit Markup</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">BenOTP API Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={settings.benotpApiKey}
                        id="benotp-api-key-input"
                        placeholder="Paste your BenOTP API Key here..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('benotp-api-key-input') as HTMLInputElement;
                          if (input) {
                            handleSaveSettings({ benotpApiKey: input.value.trim() });
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                      >
                        Save Key
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Stored securely server-side. Used for all BenOTP requests.</span>
                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={syncingProvider}
                        className="text-emerald-400 hover:underline font-bold"
                      >
                        {syncingProvider ? 'Connecting...' : '⚡ Test Key & BenOTP Balance'}
                      </button>
                    </div>
                    {syncResult && (
                      <div className={`p-2.5 rounded-xl text-xs font-bold ${
                        syncResult.includes('Connected') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {syncResult}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profit Markup Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSettings({ markupType: 'FIXED' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                          settings.markupType === 'FIXED'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Fixed (₦ NGN)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSettings({ markupType: 'PERCENTAGE' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                          settings.markupType === 'PERCENTAGE'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 max-w-xs">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Markup Value ({settings.markupType === 'FIXED' ? '₦ Naira' : '% Percent'})
                  </label>
                  <input
                    type="number"
                    defaultValue={settings.markupValue}
                    onBlur={e => handleSaveSettings({ markupValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Example: 50 adds ₦50 to each provider cost</span>
                </div>
              </div>

              {/* Real-time Diagnostics Log */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Provider API Interactions</h3>
                    <p className="text-xs text-slate-400">Live request/response trace logs for troubleshooting</p>
                  </div>
                  <button
                    onClick={() => api.admin.getDiagnostics().then(res => setDiagnosticsLogs(res.logs))}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Refresh Logs
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {diagnosticsLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No logs recorded yet.</div>
                  ) : (
                    diagnosticsLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-bold">{log.action} • {log.server}</span>
                          <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                            [{log.status}] {log.statusCode ? `Code: ${log.statusCode}` : ''}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Params: {JSON.stringify(log.params)}
                        </div>
                        {log.responsePreview && (
                          <div className="text-[10px] text-slate-500 truncate">
                            Preview: {log.responsePreview}
                          </div>
                        )}
                        {log.error && (
                          <div className="text-[10px] text-rose-400">
                            Error: {log.error}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TELEGRAM BOT ALERTS */}
          {adminTab === 'telegram' && settings && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-white">Telegram Instant Deposit Notifications</h2>
                <p className="text-xs text-slate-400">
                  Receive instant Telegram messages with transfer amounts, user names, and receipt photos when customers fund their wallets.
                </p>
              </div>

              {telegramResult && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                    telegramResult.success
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {telegramResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{telegramResult.message}</span>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">Enable Telegram Alerts</div>
                    <div className="text-[11px] text-slate-400">Send notifications for new deposit receipts</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ telegramEnabled: !settings.telegramEnabled })}
                  >
                    {settings.telegramEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Telegram Bot Token</label>
                  <input
                    type="text"
                    defaultValue={settings.telegramBotToken}
                    onBlur={e => handleSaveSettings({ telegramBotToken: e.target.value.trim() })}
                    placeholder="e.g. 123456789:ABCdefGHIjklmnOPQRstuvw"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">Obtained from @BotFather on Telegram</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Telegram Destination Chat ID</label>
                  <input
                    type="text"
                    defaultValue={settings.telegramChatId}
                    onBlur={e => handleSaveSettings({ telegramChatId: e.target.value.trim() })}
                    placeholder="e.g. 987654321 or -100123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">Your personal Telegram ID or notification group/channel ID</span>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={telegramTesting}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {telegramTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <Send className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Send Test Message to Telegram</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP DESK */}
          {adminTab === 'support' && settings && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-white">WhatsApp Customer Support Settings</h2>
                <p className="text-xs text-slate-400">Configure the WhatsApp desk number linked to all customer support buttons</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    defaultValue={settings.whatsappNumber}
                    onBlur={e => handleSaveSettings({ whatsappNumber: e.target.value.trim() })}
                    placeholder="e.g. 2348012345678 (no + or spaces)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">Must include country code (e.g. 234 for Nigeria)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Support Desk Name</label>
                  <input
                    type="text"
                    defaultValue={settings.whatsappSupportName}
                    onBlur={e => handleSaveSettings({ whatsappSupportName: e.target.value.trim() })}
                    placeholder="e.g. Marvel Nums Official Desk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Default Pre-filled Message</label>
                  <textarea
                    rows={3}
                    defaultValue={settings.whatsappDefaultMessage}
                    onBlur={e => handleSaveSettings({ whatsappDefaultMessage: e.target.value.trim() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHANGE ADMIN PASSWORD */}
          {adminTab === 'security' && (
            <div className="space-y-6 max-w-md">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-white">Change Admin Security Key</h2>
                <p className="text-xs text-slate-400">Update the master password used to access the administrative portal</p>
              </div>

              {passChangeMsg && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                    passChangeMsg.success
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {passChangeMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{passChangeMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Admin Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={newAdminPass}
                      onChange={e => setNewAdminPass(e.target.value)}
                      placeholder="Enter new strong password"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save New Password
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: FULL RECEIPT VIEWER */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl max-h-[90vh] bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3">Customer Transfer Receipt Proof</h3>
            <div className="overflow-auto max-h-[75vh] rounded-xl border border-slate-800">
              <img src={viewReceiptUrl} alt="Transfer Receipt" className="max-w-full h-auto" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL WALLET ADJUSTMENT */}
      {adjustCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Manual Wallet Adjustment</h3>
              <button onClick={() => setAdjustCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Customer: <strong className="text-white">{adjustCustomer.name}</strong> ({adjustCustomer.email})
              <div className="text-[11px] text-slate-400">Current Balance: ₦{adjustCustomer.balance.toLocaleString()}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase">Amount to Add or Deduct (₦)</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="e.g. 500 (or -500 for debit)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Positive number credits wallet; negative number debits.</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase">Reason for Audit Log</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="e.g. Promotional bonus / manual offline payment"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PAYMENT METHOD */}
      {editingPaymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingPaymentMethod.id ? 'Edit Payment Method' : 'Add New Payment Account'}
              </h3>
              <button onClick={() => setEditingPaymentMethod(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Display Title</label>
                <input
                  type="text"
                  value={editingPaymentMethod.title || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, title: e.target.value })}
                  placeholder="e.g. OPay / PalmPay / Kuda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={editingPaymentMethod.bankName || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, bankName: e.target.value })}
                  placeholder="e.g. OPay Digital Services"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Account Number</label>
                <input
                  type="text"
                  value={editingPaymentMethod.accountNumber || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, accountNumber: e.target.value })}
                  placeholder="e.g. 8123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Account Name</label>
                <input
                  type="text"
                  value={editingPaymentMethod.accountName || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, accountName: e.target.value })}
                  placeholder="e.g. Marvel Nums Enterprise"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  value={editingPaymentMethod.instructions || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, instructions: e.target.value })}
                  placeholder="e.g. Please use your registered phone number as narration"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pm-active"
                  checked={editingPaymentMethod.isActive !== false}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, isActive: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <label htmlFor="pm-active" className="text-slate-300 font-semibold cursor-pointer">
                  Active (show to customers on deposit screen)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPaymentMethod(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePaymentMethod}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
