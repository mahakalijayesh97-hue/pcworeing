import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, message: string) {
  console.log(`[TWILIO SERVICE] Sending to ${to}: ${message}`);

  if (!accountSid || !authToken || !fromPhone) {
    console.warn('[TWILIO SERVICE] Missing Credentials. Message not sent.');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      to: to,
      from: fromPhone
    });
    
    return { success: true, sid: result.sid, timestamp: new Date() };
  } catch (error: any) {
    console.error('[TWILIO SERVICE ERROR]', error.message);
    return { success: false, error: error.message };
  }
}
