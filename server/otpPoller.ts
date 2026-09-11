import { db } from './db.js';
import { benotpService } from './benotpService.js';

let pollerInterval: NodeJS.Timeout | null = null;
let isPolling = false;

export function startOtpPoller() {
  if (pollerInterval) return;

  console.log('[OTP Poller] Starting real-time OTP monitor (2s interval)...');
  pollerInterval = setInterval(async () => {
    if (isPolling) return;
    isPolling = true;

    try {
      const activeOrders = db.getActiveOrders();
      const now = Date.now();

      for (const order of activeOrders) {
        // 1. Check if 15 minutes countdown (900 seconds) has elapsed without customer cancellation
        // USER MANDATE: "also if not cancelled within 15 minutes countdown the customer will not be refunded"
        if (now >= order.expiresAt) {
          console.log(`[OTP Poller] Order ${order.id} reached 15-minute expiration without cancellation. No refund.`);

          // Release carrier line on BenOTP
          await benotpService.cancelOrder(order.serverId, order.providerOrderId);

          db.updateOrder(order.id, {
            status: 'EXPIRED',
            refunded: false,
            refundAmount: 0
          });

          db.addNotification({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            userId: order.userId,
            title: 'Order Expired (15 Minutes Elapsed)',
            message: `The 15-minute countdown expired without cancellation for ${order.serviceName} (${order.phoneNumber}). As per policy, numbers not cancelled within 15 minutes are not refunded.`,
            type: 'SYSTEM',
            read: false,
            createdAt: now
          });
          continue;
        }

        // 2. Poll provider for real-time OTP
        const res = await benotpService.checkOtpStatus(order.serverId, order.providerOrderId);

        if (res.status === 'RECEIVED' && res.code) {
          console.log(`[OTP Poller] OTP received for order ${order.id}: ${res.code}`);

          // USER MANDATE: "and also once code is detected the number cannot be cancelled"
          db.updateOrder(order.id, {
            status: 'COMPLETED',
            otpCode: res.code,
            receivedAt: now
          });

          db.addNotification({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            userId: order.userId,
            title: `SMS Code Received: ${res.code}`,
            message: `Your verification code for ${order.serviceName} on ${order.phoneNumber} is: ${res.code}`,
            type: 'OTP_RECEIVED',
            read: false,
            createdAt: now
          });
        } else if (res.status === 'CANCELLED') {
          // Provider cancelled
          console.log(`[OTP Poller] Order ${order.id} was cancelled by provider.`);
          if (!order.refunded) {
            const user = db.getUserById(order.userId);
            if (user) {
              const newBalance = user.balance + order.customerPrice;
              db.updateUser(user.id, { balance: newBalance });

              const txId = 'tx_ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
              db.addTransaction({
                id: txId,
                userId: user.id,
                type: 'REFUND',
                amount: order.customerPrice,
                balanceAfter: newBalance,
                description: `Refund for cancelled order: ${order.serviceName} (${order.phoneNumber})`,
                referenceId: order.id,
                createdAt: now
              });

              db.updateOrder(order.id, {
                status: 'CANCELLED',
                cancelledAt: now,
                refunded: true,
                refundAmount: order.customerPrice,
                refundTxId: txId
              });

              db.addNotification({
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                userId: user.id,
                title: 'Order Cancelled & Refunded',
                message: `Line reservation for ${order.serviceName} (${order.phoneNumber}) was cancelled. ₦${order.customerPrice.toLocaleString()} refunded to your wallet.`,
                type: 'REFUND_COMPLETED',
                read: false,
                createdAt: now
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[OTP Poller] Error during poll cycle:', err);
    } finally {
      isPolling = false;
    }
  }, 3000);
}
