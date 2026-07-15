interface TelegramMessage {
  title: string;
  message: string;
  url: string;
  category?: string;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

/**
 * Send a notification to Telegram using a direct bot
 * No Make.com required!
 */
export async function sendTelegramNotification(data: TelegramMessage): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('⚠️ Telegram bot token or chat ID not configured');
      return false;
    }

    // Format the message with HTML
    const message = formatTelegramMessage(data);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const result: TelegramResponse = await response.json();

    if (result.ok) {
      console.log('✅ Telegram notification sent successfully');
      return true;
    } else {
      console.log('⚠️ Telegram notification failed:', result.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Format the message with HTML styling for Telegram
 */
function formatTelegramMessage(data: TelegramMessage): string {
  const timestamp = new Date().toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `<b>${data.title}</b>\n\n`;
  message += `${data.message}\n\n`;
  message += `<b>🔗 View all jobs:</b> <a href="${data.url}">${data.url}</a>\n\n`;
  message += `<b>📂 Category:</b> ${data.category || 'General'}\n`;
  message += `<b>🕐 Time:</b> ${timestamp}\n\n`;
  message += `<i>🚀 Powered by Oak Jobs</i>`;

  return message;
}

/**
 * Send a simple text message to Telegram
 */
export async function sendTelegramText(text: string): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('⚠️ Telegram bot token or chat ID not configured');
      return false;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const result: TelegramResponse = await response.json();
    return result.ok;
  } catch (error) {
    console.error('❌ Error sending Telegram text:', error);
    return false;
  }
}

/**
 * Send a job listing to Telegram (for individual job posts)
 */
export async function sendJobToTelegram(job: any): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return false;
    }

    const message = `
<b>💼 New Job Posted!</b>

<b>📌 Title:</b> ${job.title}
<b>🏢 Company:</b> ${job.company_name}
<b>📍 Location:</b> ${job.job_location || 'N/A'}
<b>💼 Type:</b> ${job.job_type || 'N/A'}
${job.job_salary ? `<b>💰 Salary:</b> ${job.job_salary}` : ''}
${job.job_category && job.job_category.length > 0 ? `<b>📂 Category:</b> ${job.job_category.join(', ')}` : ''}

<b>🔗 Apply now:</b> <a href="${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${job.id}">View Details</a>
    `;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const result: TelegramResponse = await response.json();
    return result.ok;
  } catch (error) {
    console.error('❌ Error sending job to Telegram:', error);
    return false;
  }
}

/**
 * Test the Telegram bot connection
 */
export async function testTelegramBot(): Promise<{ success: boolean; message: string }> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return {
        success: false,
        message: 'Bot token or chat ID not configured',
      };
    }

    // Test 1: Check bot info
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();

    if (!botInfo.ok) {
      return {
        success: false,
        message: `Bot token invalid: ${botInfo.description}`,
      };
    }

    // Test 2: Send test message
    const testMessage = `
<b>✅ Telegram Bot Test Successful!</b>

<b>🤖 Bot Name:</b> ${botInfo.result.first_name}
<b>🆔 Bot Username:</b> @${botInfo.result.username}

<b>📢 This is a test message from Oak Jobs!</b>
<b>🕐 Time:</b> ${new Date().toLocaleString()}

<i>Your Telegram integration is working correctly!</i>
    `;

    const sendResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const sendResult = await sendResponse.json();

    if (sendResult.ok) {
      return {
        success: true,
        message: `✅ Test message sent to chat! Bot: @${botInfo.result.username}`,
      };
    } else {
      return {
        success: false,
        message: `Failed to send message: ${sendResult.description}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}