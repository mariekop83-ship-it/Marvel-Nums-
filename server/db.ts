import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  balance: number;
  isSuspended: boolean;
  createdAt: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  serverId: 'server1' | 'server2' | 'server3';
  serverName: string;
  countryCode: string;
  countryName: string;
  serviceCode: string;
  serviceName: string;
  providerOrderId: string;
  phoneNumber: string;
  providerPrice: number;
  customerPrice: number;
  status: 'WAITING_SMS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  otpCode: string | null;
  createdAt: number;
  expiresAt: number; // 15 minutes (900000 ms)
  receivedAt: number | null;
  cancelledAt: number | null;
  refunded: boolean;
  refundAmount: number;
  refundTxId: string | null;
}

export interface FundingRequest {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  accountDetails: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    walletAddress?: string;
    network?: string;
  };
  receiptUrl: string;
  referenceNote: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason: string | null;
  createdAt: number;
  reviewedAt: number | null;
  reviewedBy: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: string;
  createdAt: number;
}

export interface PaymentMethod {
  id: string;
  title: string;
  type: 'BANK' | 'CRYPTO' | 'MOBILE_MONEY';
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'OTP_RECEIVED' | 'PURCHASE_SUCCESS' | 'FUNDING_APPROVED' | 'FUNDING_REJECTED' | 'REFUND_COMPLETED' | 'SYSTEM';
  read: boolean;
  createdAt: number;
}

export interface AdminSettings {
  adminPassword: string;
  benotpApiKey: string;
  currencySymbol: string;
  currencyRateToNgn: number;
  markupType: 'FIXED' | 'PERCENTAGE';
  markupValue: number;
  server1Enabled: boolean;
  server2Enabled: boolean;
  server3Enabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  whatsappNumber: string;
  whatsappSupportName: string;
  whatsappDefaultMessage: string;
  lastSyncTime: number;
  lastSyncStatus: 'OK' | 'ERROR' | 'NEVER';
  lastProviderError: string;
}

export interface DiagnosticsLog {
  id: string;
  timestamp: number;
  server: string;
  action: string;
  params: Record<string, any>;
  status: 'SUCCESS' | 'FAILED';
  statusCode?: number;
  responsePreview?: string;
  error?: string;
}

export interface DatabaseSchema {
  users: User[];
  orders: Order[];
  fundingRequests: FundingRequest[];
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  notifications: UserNotification[];
  adminSettings: AdminSettings;
  diagnosticsLogs: DiagnosticsLog[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'stevelogs.json');

const DEFAULT_SETTINGS: AdminSettings = {
  adminPassword: process.env.ADMIN_PASSWORD || '292009',
  benotpApiKey: process.env.BENOTP_API_KEY || '',
  currencySymbol: '₦',
  currencyRateToNgn: 1, // multiplier if API prices are already NGN or need conversion
  markupType: 'FIXED',
  markupValue: 50, // default +₦50 markup
  server1Enabled: true,
  server2Enabled: true,
  server3Enabled: true,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  telegramEnabled: false,
  whatsappNumber: '+2348000000000',
  whatsappSupportName: 'SteveLogs Support Desk',
  whatsappDefaultMessage: 'Hello SteveLogs Support, I need assistance with my account.',
  lastSyncTime: 0,
  lastSyncStatus: 'NEVER',
  lastProviderError: ''
};

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-opay',
    title: 'OPay Instant Transfer',
    type: 'BANK',
    bankName: 'OPay Bank',
    accountName: 'SteveLogs Virtual Services',
    accountNumber: '8012345678',
    instructions: 'Transfer exact amount. Upload the transaction receipt or screenshot below for instant verification.',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'pm-palmpay',
    title: 'PalmPay Instant Transfer',
    type: 'BANK',
    bankName: 'PalmPay',
    accountName: 'SteveLogs Virtual Services',
    accountNumber: '9087654321',
    instructions: 'Send money to our official PalmPay merchant account and submit receipt.',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'pm-kuda',
    title: 'Kuda Microfinance Bank',
    type: 'BANK',
    bankName: 'Kuda Bank',
    accountName: 'SteveLogs Technologies',
    accountNumber: '2034928174',
    instructions: 'Zero transfer fee with Kuda. Upload your payment confirmation receipt.',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'pm-usdt',
    title: 'USDT (TRC-20 / BEP-20)',
    type: 'CRYPTO',
    bankName: 'Crypto Wallet',
    accountName: 'SteveLogs USDT Deposit',
    accountNumber: 'TXQ8jK7p...9zL1mN34TRC20',
    instructions: 'Send USDT (TRC-20). Upload tx hash screenshot. Rate will be credited automatically at ₦1,550/USDT.',
    isActive: true,
    sortOrder: 4
  }
];

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          orders: parsed.orders || [],
          fundingRequests: parsed.fundingRequests || [],
          transactions: parsed.transactions || [],
          paymentMethods: parsed.paymentMethods || DEFAULT_PAYMENT_METHODS,
          notifications: parsed.notifications || [],
          adminSettings: { ...DEFAULT_SETTINGS, ...(parsed.adminSettings || {}) },
          diagnosticsLogs: parsed.diagnosticsLogs || []
        };
      }
    } catch (e) {
      console.error('Failed to read db file, initializing with defaults:', e);
    }

    const initial: DatabaseSchema = {
      users: [],
      orders: [],
      fundingRequests: [],
      transactions: [],
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      notifications: [],
      adminSettings: DEFAULT_SETTINGS,
      diagnosticsLogs: []
    };

    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 100);
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.trim().toLowerCase() === normalized);
  }

  public getUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[\s\-\+\(\)]/g, '');
    return this.data.users.find(u => u.phone.replace(/[\s\-\+\(\)]/g, '') === clean);
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders.filter(o => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  public getActiveOrders(): Order[] {
    return this.data.orders.filter(o => o.status === 'WAITING_SMS');
  }

  public addOrder(order: Order) {
    this.data.orders.push(order);
    this.save();
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    Object.assign(order, updates);
    this.save();
    return order;
  }

  // Funding Requests
  public getFundingRequests(): FundingRequest[] {
    return this.data.fundingRequests.sort((a, b) => b.createdAt - a.createdAt);
  }

  public getFundingRequestById(id: string): FundingRequest | undefined {
    return this.data.fundingRequests.find(f => f.id === id);
  }

  public getFundingRequestsByUserId(userId: string): FundingRequest[] {
    return this.data.fundingRequests.filter(f => f.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  public addFundingRequest(request: FundingRequest) {
    this.data.fundingRequests.push(request);
    this.save();
  }

  public updateFundingRequest(id: string, updates: Partial<FundingRequest>): FundingRequest | undefined {
    const req = this.getFundingRequestById(id);
    if (!req) return undefined;
    Object.assign(req, updates);
    this.save();
    return req;
  }

  // Transactions
  public getTransactions(): Transaction[] {
    return this.data.transactions.sort((a, b) => b.createdAt - a.createdAt);
  }

  public getTransactionsByUserId(userId: string): Transaction[] {
    return this.data.transactions.filter(t => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  public addTransaction(tx: Transaction) {
    this.data.transactions.push(tx);
    this.save();
  }

  // Payment Methods
  public getPaymentMethods(activeOnly = false): PaymentMethod[] {
    let list = this.data.paymentMethods;
    if (activeOnly) {
      list = list.filter(pm => pm.isActive);
    }
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPaymentMethodById(id: string): PaymentMethod | undefined {
    return this.data.paymentMethods.find(pm => pm.id === id);
  }

  public addPaymentMethod(pm: PaymentMethod) {
    this.data.paymentMethods.push(pm);
    this.save();
  }

  public updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): PaymentMethod | undefined {
    const pm = this.getPaymentMethodById(id);
    if (!pm) return undefined;
    Object.assign(pm, updates);
    this.save();
    return pm;
  }

  public deletePaymentMethod(id: string): boolean {
    const idx = this.data.paymentMethods.findIndex(pm => pm.id === id);
    if (idx !== -1) {
      this.data.paymentMethods.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Notifications
  public getNotifications(userId: string): UserNotification[] {
    return this.data.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  public addNotification(notification: UserNotification) {
    this.data.notifications.push(notification);
    // Keep max 500 notifications in db
    if (this.data.notifications.length > 500) {
      this.data.notifications = this.data.notifications.slice(-500);
    }
    this.save();
  }

  public markNotificationsRead(userId: string) {
    for (const n of this.data.notifications) {
      if (n.userId === userId) {
        n.read = true;
      }
    }
    this.save();
  }

  // Settings
  public getSettings(): AdminSettings {
    if (!this.data.adminSettings.benotpApiKey && process.env.BENOTP_API_KEY) {
      this.data.adminSettings.benotpApiKey = process.env.BENOTP_API_KEY;
    }
    return this.data.adminSettings;
  }

  public updateSettings(updates: Partial<AdminSettings>): AdminSettings {
    Object.assign(this.data.adminSettings, updates);
    this.save();
    return this.data.adminSettings;
  }

  // Diagnostics logs
  public getDiagnosticsLogs(): DiagnosticsLog[] {
    return [...this.data.diagnosticsLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  }

  public addDiagnosticsLog(log: DiagnosticsLog) {
    this.data.diagnosticsLogs.unshift(log);
    if (this.data.diagnosticsLogs.length > 100) {
      this.data.diagnosticsLogs = this.data.diagnosticsLogs.slice(0, 100);
    }
    this.save();
  }
}

export const db = new Database();
