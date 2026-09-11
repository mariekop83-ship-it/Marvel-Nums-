import { User, ServerOption, Country, ServiceItem, Order, Transaction, FundingRequest, PaymentMethod, UserNotification, AdminStats, AdminSettings, DiagnosticsLog } from '../types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('marvelnums_token') || localStorage.getItem('stevelogs_token');
}

function getAdminPassword(): string | null {
  return localStorage.getItem('marvelnums_admin_password') || localStorage.getItem('stevelogs_admin_password');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const adminPass = getAdminPassword();
  if (adminPass) {
    headers.set('x-admin-password', adminPass);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  async signup(data: { name: string; email: string; phone?: string; password: string }) {
    const res = await request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('marvelnums_token', res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('marvelnums_token', res.token);
    return res;
  },

  async getMe(): Promise<{ user: User | null }> {
    const token = getAuthToken();
    if (!token) {
      return { user: null };
    }
    try {
      return await request<{ user: User }>('/auth/me');
    } catch {
      return { user: null };
    }
  },

  async updateProfile(data: { name?: string; phone?: string; password?: string }) {
    return request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  logout() {
    localStorage.removeItem('marvelnums_token');
    localStorage.removeItem('stevelogs_token');
  },

  // Notifications
  async getNotifications() {
    return request<{ notifications: UserNotification[] }>('/notifications');
  },

  async markNotificationsRead() {
    return request<{ success: boolean }>('/notifications/read', { method: 'POST' });
  },

  // Services & Catalog
  async getServers() {
    return request<{ servers: ServerOption[] }>('/services/servers');
  },

  async getCountries(server: 'server1' | 'server2' | 'server3') {
    return request<{ countries: Country[] }>(`/services/countries?server=${server}`);
  },

  async getServices(server: 'server1' | 'server2' | 'server3', countryId: string) {
    return request<{ services: ServiceItem[] }>(`/services/list?server=${server}&country=${encodeURIComponent(countryId)}`);
  },

  async getPrice(server: 'server1' | 'server2' | 'server3', countryId: string, service: string) {
    return request<{ providerPrice: number; customerPrice: number; available: boolean }>(
      `/services/price?server=${server}&country=${encodeURIComponent(countryId)}&service=${encodeURIComponent(service)}`
    );
  },

  // Orders
  async buyNumber(data: {
    serverId: 'server1' | 'server2' | 'server3';
    countryId: string;
    countryName: string;
    serviceCode: string;
    serviceName: string;
  }) {
    return request<{ success: boolean; order: Order; newBalance: number }>('/orders/buy', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMyOrders() {
    return request<{ orders: Order[] }>('/orders/my');
  },

  async getActiveOrders() {
    return request<{ orders: Order[] }>('/orders/active');
  },

  async cancelOrder(orderId: string) {
    return request<{ success: boolean; message: string; order: Order; newBalance: number }>(`/orders/${orderId}/cancel`, {
      method: 'POST'
    });
  },

  // Wallet
  async getWalletSummary() {
    return request<{
      balance: number;
      activeNumbersCount: number;
      waitingOtpsCount: number;
      completedOrdersCount: number;
      totalOrdersCount: number;
      totalSpent: number;
      totalDeposited: number;
      recentTransactions: Transaction[];
    }>('/wallet/summary');
  },

  async getTransactions() {
    return request<{ transactions: Transaction[] }>('/wallet/transactions');
  },

  async submitFundRequest(data: {
    amount: number;
    paymentMethodId: string;
    receiptUrl: string;
    referenceNote?: string;
  }) {
    return request<{ success: boolean; request: FundingRequest }>('/wallet/fund-request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMyFundRequests() {
    return request<{ requests: FundingRequest[] }>('/wallet/fund-requests');
  },

  // Payment Methods
  async getPaymentMethods() {
    return request<{ paymentMethods: PaymentMethod[] }>('/payment-methods');
  },

  // Support
  async getSupportSettings() {
    return request<{
      whatsappNumber: string;
      whatsappSupportName: string;
      whatsappDefaultMessage: string;
    }>('/support-settings');
  },

  // Admin API
  admin: {
    async verifyPassword(password: string) {
      const res = await request<{ success: boolean; message: string }>('/admin/verify', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      localStorage.setItem('marvelnums_admin_password', password);
      localStorage.setItem('stevelogs_admin_password', password);
      return res;
    },

    logout() {
      localStorage.removeItem('marvelnums_admin_password');
      localStorage.removeItem('stevelogs_admin_password');
    },

    async getDashboard() {
      return request<AdminStats>('/admin/dashboard');
    },

    async getUsers() {
      return request<{ users: (User & { ordersCount: number; fundingCount: number })[] }>('/admin/users');
    },

    async toggleSuspendUser(userId: string) {
      return request<{ user: User }>(`/admin/users/${userId}/toggle-suspend`, { method: 'POST' });
    },

    async adjustUserWallet(userId: string, amount: number, reason: string) {
      return request<{ success: boolean; newBalance: number }>(`/admin/users/${userId}/adjust-wallet`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      });
    },

    async getOrders(params: { server?: string; status?: string; search?: string } = {}) {
      const query = new URLSearchParams();
      if (params.server) query.set('server', params.server);
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      return request<{ orders: Order[] }>(`/admin/orders?${query.toString()}`);
    },

    async getFundingRequests() {
      return request<{ requests: FundingRequest[] }>('/admin/funding-requests');
    },

    async approveFunding(requestId: string) {
      return request<{ success: boolean; message: string }>(`/admin/funding-requests/${requestId}/approve`, {
        method: 'POST'
      });
    },

    async rejectFunding(requestId: string, reason: string) {
      return request<{ success: boolean; message: string }>(`/admin/funding-requests/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },

    async getPaymentMethods() {
      return request<{ paymentMethods: PaymentMethod[] }>('/admin/payment-methods');
    },

    async savePaymentMethod(pm: Partial<PaymentMethod> & { id?: string }) {
      if (pm.id) {
        return request<{ success: boolean; paymentMethod: PaymentMethod }>(`/admin/payment-methods/${pm.id}`, {
          method: 'PUT',
          body: JSON.stringify(pm)
        });
      }
      return request<{ success: boolean; paymentMethod: PaymentMethod }>('/admin/payment-methods', {
        method: 'POST',
        body: JSON.stringify(pm)
      });
    },

    async deletePaymentMethod(id: string) {
      return request<{ success: boolean }>(`/admin/payment-methods/${id}`, { method: 'DELETE' });
    },

    async getSettings() {
      return request<{ settings: AdminSettings }>('/admin/settings');
    },

    async updateSettings(settings: Partial<AdminSettings>) {
      return request<{ success: boolean; settings: AdminSettings }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    },

    async changePassword(newPassword: string) {
      const res = await request<{ success: boolean; message: string }>('/admin/settings/password', {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      localStorage.setItem('stevelogs_admin_password', newPassword);
      return res;
    },

    async testTelegram(botToken: string, chatId: string) {
      return request<{ success: boolean; message: string }>('/admin/settings/test-telegram', {
        method: 'POST',
        body: JSON.stringify({ botToken, chatId })
      });
    },

    async getDiagnostics() {
      return request<{
        apiKeyConfigured: boolean;
        apiKeyMasked: string;
        balance: number;
        connectionStatus: 'CONNECTED' | 'DISCONNECTED';
        lastSyncTime: number;
        lastSyncStatus: 'OK' | 'ERROR' | 'NEVER';
        lastProviderError: string;
        servers: { id: string; name: string; url: string; enabled: boolean }[];
        logs: DiagnosticsLog[];
      }>('/admin/diagnostics');
    },

    async syncNow() {
      return request<{ success: boolean; balance: number; error?: string }>('/admin/diagnostics/sync-now', {
        method: 'POST'
      });
    }
  }
};
