/**
 * SMS Service Utility - Msg91 Implementation
 */

const authKey = process.env.MSG91_AUTH_KEY;
const templateId = process.env.MSG91_TEMPLATE_ID;

export async function sendSMS(to: string, message: string) {
  console.log(`[MSG91 SERVICE] Sending to ${to}: ${message}`);

  if (!authKey || !templateId) {
    console.warn('[MSG91 SERVICE] Missing Auth Key or Template ID. Message not sent.');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    // Normalizing phone number (removing + for Msg91 usually)
    const normalizedMobile = to.replace(/[^0-9]/g, '');

    const response = await fetch("https://control.msg91.com/api/v5/otp?template_id=" + templateId + "&mobile=" + normalizedMobile + "&authkey=" + authKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Msg91 Template variables (adjust based on your template)
        "pending_amount": message // Or whatever variable you named in Msg91
      })
    });

    const result = await response.json();
    console.log('[MSG91 RESPONSE]', result);
    
    return { success: result.type === 'success', result };
  } catch (error: any) {
    console.error('[MSG91 SERVICE ERROR]', error.message);
    return { success: false, error: error.message };
  }
}
