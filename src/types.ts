export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  balance: number;
  isSuspended: boolean;
  createdAt: number;
}

export interface ServerOption {
  id: 'server1' | 'server2' | 'server3';
  name: string;
  type: 'USA_ONLY' | 'WORLDWIDE';
  description: string;
  enabled: boolean;
  badge: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export interface ServiceItem {
  code: string;
  shortCode?: string;
  name: string;
  icon?: string;
  providerPrice: number;
  customerPrice: number;
  available: boolean;
  count: number;
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
  expiresAt: number; // 15 mins (900000ms)
  receivedAt: number | null;
  cancelledAt: number | null;
  refunded: boolean;
  refundAmount: number;
  refundTxId: string | null;
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

export interface AdminStats {
  totalCustomers: number;
  activeCustomers: number;
  walletFundingTotal: number;
  pendingFundingCount: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundsTotal: number;
  grossRevenue: number;
  estimatedMarkupProfit: number;
  providerBalance: number;
  providerBalanceCurrency: string;
  providerStatus: 'CONNECTED' | 'DISCONNECTED';
  server1Enabled: boolean;
  server2Enabled: boolean;
  server3Enabled: boolean;
}

export interface AdminSettings {
  adminPassword?: string;
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
