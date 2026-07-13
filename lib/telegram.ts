interface TelegramMessage {
  title: string;
  message: string;
  url: string;
  category?: string;
}

export async function sendTelegramNotification(data: TelegramMessage): Promise<boolean> {
  try {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('⚠️ Telegram webhook not configured');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        message: data.message,
        url: data.url,
        category: data.category || 'Jobs',
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log('✅ Telegram notification sent successfully');
      return true;
    } else {
      console.log('⚠️ Telegram notification failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}