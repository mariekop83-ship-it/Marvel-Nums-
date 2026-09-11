import { db, FundingRequest } from './db.js';

export async function sendTelegramFundingAlert(request: FundingRequest) {
  const settings = db.getSettings();
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return;
  }

  const token = settings.telegramBotToken.trim();
  const chatId = settings.telegramChatId.trim();

  const formattedAmount = `₦${Number(request.amount).toLocaleString('en-NG')}`;
  const formattedDate = new Date(request.createdAt).toLocaleString('en-US', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const messageText = `🔔 *New Wallet Deposit Submitted*

👤 *Customer:* ${escapeMarkdown(request.customerName)}
📧 *Email:* ${escapeMarkdown(request.customerEmail)}
💰 *Amount:* *${formattedAmount}*
🆔 *Funding ID:* \`${request.id}\`
🏦 *Payment Method:* ${escapeMarkdown(request.paymentMethodName)}
📅 *Date/Time:* ${formattedDate}
📝 *Reference/Note:* ${escapeMarkdown(request.referenceNote || 'N/A')}

👉 _Review and approve in SteveLogs Admin Panel_`;

  try {
    // If receiptUrl is a data URL or image url, attempt sendPhoto or sendMessage
    if (request.receiptUrl && request.receiptUrl.startsWith('http')) {
      const photoUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
      await fetch(photoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: request.receiptUrl,
          caption: messageText,
          parse_mode: 'Markdown'
        })
      });
    } else {
      const sendMsgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(sendMsgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
    }
  } catch (err) {
    console.error('Failed to dispatch Telegram notification:', err);
  }
}

export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ *SteveLogs Telegram Notification Test*\n\nYour Telegram bot configuration is working perfectly! You will receive real-time alerts whenever a customer submits wallet deposit receipts.`,
        parse_mode: 'Markdown'
      })
    });
    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Test message sent successfully to your Telegram chat!' };
    }
    return { success: false, message: data.description || 'Failed to send test message' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Telegram network error' };
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
