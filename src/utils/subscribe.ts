export interface SubscribeData {
  email: string;
  name?: string;
}

/**
 * Sends a fetch POST request to the serverless function (/api/subscribe)
 * containing { name, email } to insert into Postgres DB.
 */
export async function submitSubscriber(data: SubscribeData): Promise<{ success: boolean; message?: string }> {
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

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.success) {
      return { success: true, message: result.message };
    }

    return {
      success: false,
      message: result.message || 'Failed to submit form. Please try again.',
    };
  } catch (error) {
    console.error('API subscribe endpoint error:', error);
    return { success: false, message: 'Network error submitting subscription form.' };
  }
}
