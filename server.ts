import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, User, Order, FundingRequest } from './server/db.js';
import { benotpService } from './server/benotpService.js';
import { startOtpPoller } from './server/otpPoller.js';
import { sendTelegramFundingAlert, testTelegramConnection } from './server/telegramService.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------
// Authentication Helpers & Middleware
// ----------------------------------------------------
function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, ts: Date.now() });
  return `mvt_${Buffer.from(payload).toString('base64url')}`;
}

function parseUserFromToken(req: Request): User | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7).trim();
  if (!token) return null;

  // 1. New token format: mvt_<base64url JSON>
  if (token.startsWith('mvt_')) {
    try {
      const decoded = Buffer.from(token.substring(4), 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);
      if (payload && payload.userId) {
        const user = db.getUserById(payload.userId);
        if (user) return user;
      }
    } catch {
      // ignore
    }
  }

  // 2. Compatibility for legacy and alternate tokens: stk_usr_...
  const allUsers = db.getUsers();
  for (const u of allUsers) {
    if (
      token === u.id ||
      token.startsWith(`stk_${u.id}_`) ||
      token === `stk_${u.id}` ||
      token.includes(u.id)
    ) {
      return u;
    }
  }

  // 3. Fallback: try stripping 'stk_' and last timestamp segment
  if (token.startsWith('stk_')) {
    const withoutPrefix = token.substring(4);
    const lastUnderscore = withoutPrefix.lastIndexOf('_');
    const possibleUserId = lastUnderscore > 0 ? withoutPrefix.substring(0, lastUnderscore) : withoutPrefix;
    const user = db.getUserById(possibleUserId);
    if (user) return user;
  }

  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = parseUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  if (user.isSuspended) {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminPasswordHeader = req.headers['x-admin-password'];
  const settings = db.getSettings();
  const validPassword = settings.adminPassword || '292009';

  if (adminPasswordHeader && adminPasswordHeader === validPassword) {
    return next();
  }

  // Also check if bearer user is admin role
  const user = parseUserFromToken(req);
  if (user && user.role === 'admin') {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized admin access. Please provide the correct admin key.' });
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Marvel Nums API Gateway',
    timestamp: Date.now()
  });
});

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (db.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newUser: User = {
      id: userId,
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone || '').trim(),
      passwordHash: String(password), // In production hash with bcrypt
      role: 'customer',
      balance: 0,
      isSuspended: false,
      createdAt: Date.now()
    };

    db.addUser(newUser);

    // Add welcome notification
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId,
      title: 'Welcome to Marvel Nums!',
      message: 'Your account is ready. Fund your wallet to start ordering high-speed virtual numbers.',
      type: 'SYSTEM',
      read: false,
      createdAt: Date.now()
    });

    const token = generateToken(userId);
    const { passwordHash: _, ...safeUser } = newUser;
    return res.json({ token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.getUserByEmail(cleanEmail);
    if (!user || user.passwordHash !== String(password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended. Contact SteveLogs support.' });
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put('/api/auth/profile', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { name, phone, password } = req.body;

  const updates: Partial<User> = {};
  if (name) updates.name = String(name).trim();
  if (phone) updates.phone = String(phone).trim();
  if (password) updates.passwordHash = String(password);

  const updated = db.updateUser(user.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found' });

  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// Notifications
app.get('/api/notifications', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const notifs = db.getNotifications(user.id);
  res.json({ notifications: notifs });
});

app.post('/api/notifications/read', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  db.markNotificationsRead(user.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// Services & Catalog Routes
// ----------------------------------------------------
app.get('/api/services/servers', (req, res) => {
  const allServers = benotpService.getServers();
  // Filter for customer view: only enabled servers
  const available = allServers.filter(s => s.enabled);
  res.json({ servers: available });
});

app.get('/api/services/countries', async (req, res) => {
  try {
    const serverId = (req.query.server as 'server1' | 'server2' | 'server3') || 'server1';
    const countries = await benotpService.getCountries(serverId);
    res.json({ countries });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load countries' });
  }
});

app.get('/api/services/list', async (req, res) => {
  try {
    const serverId = (req.query.server as 'server1' | 'server2' | 'server3') || 'server1';
    const countryId = String(req.query.country || (serverId === 'server1' ? '187' : '0'));
    const services = await benotpService.getServices(serverId, countryId);
    res.json({ services });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load services' });
  }
});

app.get('/api/services/price', async (req, res) => {
  try {
    const serverId = (req.query.server as 'server1' | 'server2' | 'server3') || 'server1';
    const countryId = String(req.query.country || '0');
    const service = String(req.query.service || 'whatsapp');
    const priceInfo = await benotpService.getRealtimePrice(serverId, countryId, service);
    res.json(priceInfo);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// ----------------------------------------------------
// Number Purchase & Order Management
// ----------------------------------------------------
app.post('/api/orders/buy', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as User;
    const { serverId, countryId, countryName, serviceCode, serviceName } = req.body;

    if (!serverId || !serviceCode) {
      return res.status(400).json({ error: 'Server and service are required.' });
    }

    // 1. Verify server is enabled by admin
    const settings = db.getSettings();
    if (serverId === 'server1' && !settings.server1Enabled) {
      return res.status(400).json({ error: 'Server 1 is currently undergoing maintenance. Please select Server 2 or Server 3.' });
    }
    if (serverId === 'server2' && !settings.server2Enabled) {
      return res.status(400).json({ error: 'Server 2 is currently undergoing maintenance. Please select Server 1 or Server 3.' });
    }
    if (serverId === 'server3' && !settings.server3Enabled) {
      return res.status(400).json({ error: 'Server 3 is currently undergoing maintenance. Please select Server 1 or Server 2.' });
    }

    // 2. Fetch live price
    const priceInfo = await benotpService.getRealtimePrice(
      serverId,
      countryId || (serverId === 'server1' ? '187' : '0'),
      serviceCode
    );

    const customerPrice = priceInfo.customerPrice;

    // 3. Check customer balance
    if (user.balance < customerPrice) {
      return res.status(400).json({
        error: `Insufficient wallet balance. Price is ₦${customerPrice.toLocaleString()}, but your balance is ₦${user.balance.toLocaleString()}. Please fund your wallet.`,
        requiredAmount: customerPrice,
        currentBalance: user.balance
      });
    }

    // 4. Send purchase request to real BenOTP provider
    const purchaseResult = await benotpService.purchaseNumber(
      serverId,
      countryId || (serverId === 'server1' ? '187' : '0'),
      serviceCode
    );

    if (!purchaseResult.success || !purchaseResult.providerOrderId || !purchaseResult.phoneNumber) {
      return res.status(400).json({
        error: purchaseResult.error || 'Carrier was unable to allocate a line. Your wallet was NOT charged. Please try another server or service.'
      });
    }

    // 5. Deduct customer balance safely
    const newBalance = user.balance - customerPrice;
    db.updateUser(user.id, { balance: newBalance });

    // 6. Create transaction record
    const txId = 'tx_pur_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    db.addTransaction({
      id: txId,
      userId: user.id,
      type: 'PURCHASE',
      amount: customerPrice,
      balanceAfter: newBalance,
      description: `Purchased ${serviceName || serviceCode} number (${purchaseResult.phoneNumber})`,
      referenceId: purchaseResult.providerOrderId,
      createdAt: Date.now()
    });

    // 7. Create persistent order with 15-minute countdown (900 seconds)
    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = Date.now();
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      serverId,
      serverName: serverId === 'server1' ? 'Server 1 — USA Instant' : serverId === 'server2' ? 'Server 2 — Worldwide Standard' : 'Server 3 — Worldwide High-Capacity',
      countryCode: countryId || 'US',
      countryName: countryName || (serverId === 'server1' ? 'United States' : 'Worldwide'),
      serviceCode,
      serviceName: serviceName || serviceCode,
      providerOrderId: purchaseResult.providerOrderId,
      phoneNumber: purchaseResult.phoneNumber,
      providerPrice: purchaseResult.providerPrice || priceInfo.providerPrice,
      customerPrice,
      status: 'WAITING_SMS',
      otpCode: null,
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000, // Exactly 15 minutes as BenOTP
      receivedAt: null,
      cancelledAt: null,
      refunded: false,
      refundAmount: 0,
      refundTxId: null
    };

    db.addOrder(newOrder);

    // 8. Add user notification
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: user.id,
      title: 'Number Allocated Successfully!',
      message: `Your number ${newOrder.phoneNumber} for ${newOrder.serviceName} is active. Waiting for your verification SMS.`,
      type: 'PURCHASE_SUCCESS',
      read: false,
      createdAt: now
    });

    return res.json({
      success: true,
      order: newOrder,
      newBalance
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Purchase failed' });
  }
});

app.get('/api/orders/my', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const orders = db.getOrdersByUserId(user.id);
  res.json({ orders });
});

app.get('/api/orders/active', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const orders = db.getOrdersByUserId(user.id).filter(o => o.status === 'WAITING_SMS');
  res.json({ orders });
});

app.post('/api/orders/:id/cancel', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as User;
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this order.' });
    }

    if (order.status !== 'WAITING_SMS') {
      return res.status(400).json({
        error: `Order cannot be cancelled. Current status is ${order.status}.`
      });
    }

    // MANDATE: "once code is detected the number cannot be cancelled"
    if (order.otpCode) {
      return res.status(400).json({
        error: 'Cannot cancel order: Verification SMS code has already been detected. Completed lines cannot be cancelled.'
      });
    }

    // MANDATE: "also if not cancelled within 15 minutes countdown the customer will not be refunded"
    if (Date.now() >= order.expiresAt) {
      return res.status(400).json({
        error: 'The 15-minute cancellation window has expired. Orders not cancelled within 15 minutes cannot be cancelled or refunded.'
      });
    }

    // Cancel on BenOTP provider (action=setStatus&status=8) to release line and refund BenOTP account
    const cancelRes = await benotpService.cancelOrder(order.serverId, order.providerOrderId);

    // Process idempotent refund
    if (!order.refunded) {
      const currentUser = db.getUserById(user.id)!;
      const newBalance = currentUser.balance + order.customerPrice;
      db.updateUser(user.id, { balance: newBalance });

      const txId = 'tx_ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      db.addTransaction({
        id: txId,
        userId: user.id,
        type: 'REFUND',
        amount: order.customerPrice,
        balanceAfter: newBalance,
        description: `Refund for cancelled number: ${order.serviceName} (${order.phoneNumber})`,
        referenceId: order.id,
        createdAt: Date.now()
      });

      const updated = db.updateOrder(order.id, {
        status: 'CANCELLED',
        cancelledAt: Date.now(),
        refunded: true,
        refundAmount: order.customerPrice,
        refundTxId: txId
      });

      db.addNotification({
        id: 'notif_' + Date.now(),
        userId: user.id,
        title: 'Number Cancelled & Refunded',
        message: `Line for ${order.serviceName} (${order.phoneNumber}) was cancelled. ₦${order.customerPrice.toLocaleString()} has been returned to your wallet.`,
        type: 'REFUND_COMPLETED',
        read: false,
        createdAt: Date.now()
      });

      return res.json({
        success: true,
        message: 'Order cancelled successfully and funds refunded to your wallet.',
        order: updated,
        newBalance
      });
    }

    return res.json({ success: true, order, newBalance: user.balance });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to cancel order' });
  }
});

// ----------------------------------------------------
// Wallet & Funding Routes
// ----------------------------------------------------
app.get('/api/wallet/summary', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const txs = db.getTransactionsByUserId(user.id);
  const orders = db.getOrdersByUserId(user.id);
  const activeOrders = orders.filter(o => o.status === 'WAITING_SMS');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const totalSpent = orders
    .filter(o => o.status === 'COMPLETED' || (o.status === 'WAITING_SMS' && !o.refunded))
    .reduce((sum, o) => sum + o.customerPrice, 0);

  const totalDeposited = txs
    .filter(t => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    balance: user.balance,
    activeNumbersCount: activeOrders.length,
    waitingOtpsCount: activeOrders.length,
    completedOrdersCount: completedOrders.length,
    totalOrdersCount: orders.length,
    totalSpent,
    totalDeposited,
    recentTransactions: txs.slice(0, 10)
  });
});

app.get('/api/wallet/transactions', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const txs = db.getTransactionsByUserId(user.id);
  res.json({ transactions: txs });
});

app.post('/api/wallet/fund-request', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as User;
    const { amount, paymentMethodId, receiptUrl, referenceNote } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      return res.status(400).json({ error: 'Minimum wallet funding amount is ₦100.' });
    }

    const pm = db.getPaymentMethodById(paymentMethodId);
    if (!pm) {
      return res.status(400).json({ error: 'Selected payment method not found.' });
    }

    // Generate persistent funding ID (e.g. FUND-48192)
    const fundId = `FUND-${Math.floor(10000 + Math.random() * 90000)}`;

    const fundingRequest: FundingRequest = {
      id: fundId,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      amount: numAmount,
      paymentMethodId: pm.id,
      paymentMethodName: `${pm.title} (${pm.bankName})`,
      accountDetails: {
        bankName: pm.bankName,
        accountName: pm.accountName,
        accountNumber: pm.accountNumber
      },
      receiptUrl: receiptUrl || '',
      referenceNote: referenceNote || '',
      status: 'PENDING',
      rejectReason: null,
      createdAt: Date.now(),
      reviewedAt: null,
      reviewedBy: null
    };

    db.addFundingRequest(fundingRequest);

    // Send instant Telegram notification to Admin
    sendTelegramFundingAlert(fundingRequest).catch(err => {
      console.error('Telegram dispatch error:', err);
    });

    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: user.id,
      title: 'Deposit Receipt Submitted',
      message: `Your deposit request for ₦${numAmount.toLocaleString()} (${fundId}) has been received. Our automated verification desk will approve it shortly.`,
      type: 'SYSTEM',
      read: false,
      createdAt: Date.now()
    });

    return res.json({
      success: true,
      request: fundingRequest
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit funding request' });
  }
});

app.get('/api/wallet/fund-requests', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const requests = db.getFundingRequestsByUserId(user.id);
  res.json({ requests });
});

// Payment Methods for Customers
app.get('/api/payment-methods', (req, res) => {
  const activeMethods = db.getPaymentMethods(true);
  res.json({ paymentMethods: activeMethods });
});

// Support Settings
app.get('/api/support-settings', (req, res) => {
  const settings = db.getSettings();
  res.json({
    whatsappNumber: settings.whatsappNumber,
    whatsappSupportName: settings.whatsappSupportName,
    whatsappDefaultMessage: settings.whatsappDefaultMessage
  });
});

// ----------------------------------------------------
// Admin Routes (Protected with /stevelog-admin & password)
// ----------------------------------------------------
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  const settings = db.getSettings();
  const validPassword = settings.adminPassword || '292009';

  if (password === validPassword) {
    return res.json({ success: true, message: 'Admin authenticated' });
  }
  return res.status(401).json({ error: 'Incorrect admin password.' });
});

app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const users = db.getUsers();
    const orders = db.getOrders();
    const funding = db.getFundingRequests();
    const txs = db.getTransactions();
    const settings = db.getSettings();

    const activeUsers = users.filter(u => !u.isSuspended).length;
    const totalDepositsApproved = funding
      .filter(f => f.status === 'APPROVED')
      .reduce((sum, f) => sum + f.amount, 0);

    const pendingFundingCount = funding.filter(f => f.status === 'PENDING').length;
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'WAITING_SMS').length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'EXPIRED').length;
    const refundsTotal = orders.filter(o => o.refunded).reduce((sum, o) => sum + o.refundAmount, 0);

    const grossRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.customerPrice, 0);
    const providerCosts = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.providerPrice, 0);
    const estimatedMarkupProfit = grossRevenue - providerCosts;

    // Provider balance check
    const providerBalanceRes = await benotpService.getBalance();

    res.json({
      totalCustomers: users.length,
      activeCustomers: activeUsers,
      walletFundingTotal: totalDepositsApproved,
      pendingFundingCount,
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      refundsTotal,
      grossRevenue,
      estimatedMarkupProfit,
      providerBalance: providerBalanceRes.balance,
      providerBalanceCurrency: providerBalanceRes.currency,
      providerStatus: providerBalanceRes.success ? 'CONNECTED' : 'DISCONNECTED',
      server1Enabled: settings.server1Enabled,
      server2Enabled: settings.server2Enabled,
      server3Enabled: settings.server3Enabled
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => {
    const orders = db.getOrdersByUserId(u.id);
    const funding = db.getFundingRequestsByUserId(u.id);
    const { passwordHash: _, ...safe } = u;
    return {
      ...safe,
      ordersCount: orders.length,
      fundingCount: funding.length
    };
  });
  res.json({ users });
});

app.post('/api/admin/users/:id/toggle-suspend', requireAdmin, (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = db.updateUser(user.id, { isSuspended: !user.isSuspended });
  res.json({ user: updated });
});

app.post('/api/admin/users/:id/adjust-wallet', requireAdmin, (req, res) => {
  const { amount, reason } = req.body;
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return res.status(400).json({ error: 'Valid non-zero adjustment amount is required.' });
  }
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'A clear reason is required for manual wallet adjustments.' });
  }

  const newBalance = Math.max(0, user.balance + numAmount);
  db.updateUser(user.id, { balance: newBalance });

  const txId = 'tx_adj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  db.addTransaction({
    id: txId,
    userId: user.id,
    type: 'ADMIN_ADJUSTMENT',
    amount: numAmount,
    balanceAfter: newBalance,
    description: `Manual adjustment by admin: ${reason}`,
    referenceId: txId,
    createdAt: Date.now()
  });

  db.addNotification({
    id: 'notif_' + Date.now(),
    userId: user.id,
    title: 'Wallet Balance Adjusted',
    message: `Your wallet balance was adjusted by ₦${numAmount.toLocaleString()} (${numAmount > 0 ? 'Credit' : 'Debit'}). Reason: ${reason}. New balance: ₦${newBalance.toLocaleString()}.`,
    type: 'SYSTEM',
    read: false,
    createdAt: Date.now()
  });

  res.json({ success: true, newBalance });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const { server, status, search } = req.query;
  let orders = db.getOrders();

  if (server) {
    orders = orders.filter(o => o.serverId === server);
  }
  if (status) {
    orders = orders.filter(o => o.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(o =>
      o.phoneNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.providerOrderId.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q)
    );
  }

  res.json({ orders: orders.sort((a, b) => b.createdAt - a.createdAt) });
});

app.get('/api/admin/funding-requests', requireAdmin, (req, res) => {
  const requests = db.getFundingRequests();
  res.json({ requests });
});

app.post('/api/admin/funding-requests/:id/approve', requireAdmin, (req, res) => {
  const request = db.getFundingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Funding request not found' });

  // IDEMPOTENCY CHECK: Do not credit twice!
  if (request.status === 'APPROVED') {
    return res.status(400).json({ error: 'This deposit request has already been approved and credited.' });
  }

  const user = db.getUserById(request.userId);
  if (!user) return res.status(404).json({ error: 'Customer account not found' });

  // Credit user wallet
  const newBalance = user.balance + request.amount;
  db.updateUser(user.id, { balance: newBalance });

  // Log deposit transaction
  const txId = 'tx_dep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  db.addTransaction({
    id: txId,
    userId: user.id,
    type: 'DEPOSIT',
    amount: request.amount,
    balanceAfter: newBalance,
    description: `Wallet funded via ${request.paymentMethodName} (Req: ${request.id})`,
    referenceId: request.id,
    createdAt: Date.now()
  });

  // Update request status
  db.updateFundingRequest(request.id, {
    status: 'APPROVED',
    reviewedAt: Date.now(),
    reviewedBy: 'Admin'
  });

  // Notify customer
  db.addNotification({
    id: 'notif_' + Date.now(),
    userId: user.id,
    title: 'Wallet Deposit Approved! 💰',
    message: `Your deposit of ₦${request.amount.toLocaleString()} has been confirmed and credited to your wallet. You can now purchase numbers.`,
    type: 'FUNDING_APPROVED',
    read: false,
    createdAt: Date.now()
  });

  res.json({ success: true, message: 'Funding approved and wallet credited exactly once.' });
});

app.post('/api/admin/funding-requests/:id/reject', requireAdmin, (req, res) => {
  const { reason } = req.body;
  const request = db.getFundingRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Funding request not found' });

  if (request.status === 'APPROVED') {
    return res.status(400).json({ error: 'Cannot reject an already approved request.' });
  }

  db.updateFundingRequest(request.id, {
    status: 'REJECTED',
    rejectReason: reason || 'Receipt verification failed or payment not received.',
    reviewedAt: Date.now(),
    reviewedBy: 'Admin'
  });

  db.addNotification({
    id: 'notif_' + Date.now(),
    userId: request.userId,
    title: 'Wallet Deposit Declined',
    message: `Your deposit request for ₦${request.amount.toLocaleString()} was declined. Reason: ${reason || 'Receipt unverified'}. Please contact support if you believe this is an error.`,
    type: 'FUNDING_REJECTED',
    read: false,
    createdAt: Date.now()
  });

  res.json({ success: true, message: 'Funding request marked as rejected.' });
});

// Payment Methods Admin
app.get('/api/admin/payment-methods', requireAdmin, (req, res) => {
  const methods = db.getPaymentMethods(false);
  res.json({ paymentMethods: methods });
});

app.post('/api/admin/payment-methods', requireAdmin, (req, res) => {
  const { title, type, bankName, accountName, accountNumber, instructions, isActive } = req.body;
  const pm = {
    id: 'pm_' + Date.now(),
    title: title || 'Bank Account',
    type: type || 'BANK',
    bankName: bankName || '',
    accountName: accountName || '',
    accountNumber: accountNumber || '',
    instructions: instructions || '',
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: db.getPaymentMethods().length + 1
  };
  db.addPaymentMethod(pm);
  res.json({ success: true, paymentMethod: pm });
});

app.put('/api/admin/payment-methods/:id', requireAdmin, (req, res) => {
  const updated = db.updatePaymentMethod(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Payment method not found' });
  res.json({ success: true, paymentMethod: updated });
});

app.delete('/api/admin/payment-methods/:id', requireAdmin, (req, res) => {
  const ok = db.deletePaymentMethod(req.params.id);
  res.json({ success: ok });
});

// Admin Settings & Server Toggles
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const {
    benotpApiKey,
    markupType,
    markupValue,
    server1Enabled,
    server2Enabled,
    server3Enabled,
    telegramBotToken,
    telegramChatId,
    telegramEnabled,
    whatsappNumber,
    whatsappSupportName,
    whatsappDefaultMessage
  } = req.body;

  const updates: any = {};
  if (benotpApiKey !== undefined) updates.benotpApiKey = String(benotpApiKey).trim();
  if (markupType !== undefined) updates.markupType = markupType;
  if (markupValue !== undefined) updates.markupValue = Number(markupValue);
  if (server1Enabled !== undefined) updates.server1Enabled = Boolean(server1Enabled);
  if (server2Enabled !== undefined) updates.server2Enabled = Boolean(server2Enabled);
  if (server3Enabled !== undefined) updates.server3Enabled = Boolean(server3Enabled);
  if (telegramBotToken !== undefined) updates.telegramBotToken = String(telegramBotToken).trim();
  if (telegramChatId !== undefined) updates.telegramChatId = String(telegramChatId).trim();
  if (telegramEnabled !== undefined) updates.telegramEnabled = Boolean(telegramEnabled);
  if (whatsappNumber !== undefined) updates.whatsappNumber = String(whatsappNumber).trim();
  if (whatsappSupportName !== undefined) updates.whatsappSupportName = String(whatsappSupportName).trim();
  if (whatsappDefaultMessage !== undefined) updates.whatsappDefaultMessage = String(whatsappDefaultMessage).trim();

  const newSettings = db.updateSettings(updates);
  res.json({ success: true, settings: newSettings });
});

app.post('/api/admin/settings/password', requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  db.updateSettings({ adminPassword: String(newPassword).trim() });
  res.json({ success: true, message: 'Admin password updated successfully!' });
});

app.post('/api/admin/settings/test-telegram', requireAdmin, async (req, res) => {
  const { botToken, chatId } = req.body;
  const result = await testTelegramConnection(botToken, chatId);
  res.json(result);
});

app.get('/api/admin/diagnostics', requireAdmin, async (req, res) => {
  const settings = db.getSettings();
  const balanceRes = await benotpService.getBalance();
  const logs = db.getDiagnosticsLogs();

  res.json({
    apiKeyConfigured: Boolean(settings.benotpApiKey),
    apiKeyMasked: settings.benotpApiKey ? `${settings.benotpApiKey.substring(0, 4)}...${settings.benotpApiKey.slice(-4)}` : 'Not Set',
    balance: balanceRes.balance,
    connectionStatus: balanceRes.success ? 'CONNECTED' : 'DISCONNECTED',
    lastSyncTime: settings.lastSyncTime,
    lastSyncStatus: settings.lastSyncStatus,
    lastProviderError: settings.lastProviderError || balanceRes.error || 'None',
    servers: [
      { id: 'server1', name: 'USA Server 1', url: 'https://benotp.com/stubs/handler_api.php', enabled: settings.server1Enabled },
      { id: 'server2', name: 'All Countries Server 2', url: 'https://benotp.com/stubs/all_server_2.php', enabled: settings.server2Enabled },
      { id: 'server3', name: 'All Countries Server 1', url: 'https://benotp.com/stubs/handler.php', enabled: settings.server3Enabled }
    ],
    logs
  });
});

app.post('/api/admin/diagnostics/sync-now', requireAdmin, async (req, res) => {
  const balanceRes = await benotpService.getBalance();
  res.json({
    success: balanceRes.success,
    balance: balanceRes.balance,
    error: balanceRes.error
  });
});

// ----------------------------------------------------
// Vite Dev & Production Static Serving
// ----------------------------------------------------
async function start() {
  // Start background OTP polling worker
  startOtpPoller();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SteveLogs Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
