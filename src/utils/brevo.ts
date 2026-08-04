export interface BrevoContactData {
  email: string;
  name?: string;
}

/**
 * Sends a fetch POST request to the Vercel serverless function (/api/subscribe)
 * containing { name, email }. Fallbacks to direct Brevo API call if testing locally on Vite dev server.
 */
export async function submitToBrevo(data: BrevoContactData): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name || '',
        email: data.email,
      }),
    });

    // If running under Vercel or serverless environment
    if (response.status !== 404) {
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        return { success: true, message: result.message };
      }
      return {
        success: false,
        message: result.message || 'Failed to submit form. Please try again.',
      };
    }
  } catch (error) {
    console.warn('Vercel /api/subscribe endpoint not active locally, using direct Brevo API fallback:', error);
  }

  // Fallback for local Vite dev server testing without Vercel CLI serverless environment
  const apiKey = import.meta.env.VITE_BREVO_API_KEY;
  const listIdEnv = import.meta.env.VITE_BREVO_LIST_ID || '2';
  const firstName = data.name ? data.name.trim().split(' ')[0] : '';
  const lastName = data.name && data.name.trim().split(' ').length > 1 ? data.name.trim().split(' ').slice(1).join(' ') : '';
  const listIds = listIdEnv && !isNaN(Number(listIdEnv)) ? [Number(listIdEnv)] : [2];

  try {
    const directResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: data.email.trim(),
        attributes: {
          FNAME: firstName || data.name || '',
          LNAME: lastName || '',
          FULLNAME: data.name || '',
        },
        listIds: listIds,
        updateEnabled: true,
      }),
    });

    if (directResponse.ok || directResponse.status === 201 || directResponse.status === 204) {
      return { success: true, message: 'Successfully subscribed to Betryd Early Access!' };
    }

    const resData = await directResponse.json().catch(() => ({}));
    if (resData.code === 'duplicate_parameter') {
      return { success: true, message: 'You are already registered on our list!' };
    }

    return {
      success: false,
      message: resData.message || 'Failed to connect to Brevo API.',
    };
  } catch (err: any) {
    console.error('Brevo Direct API Error:', err);
    return { success: false, message: 'Network error submitting subscription form.' };
  }
}
