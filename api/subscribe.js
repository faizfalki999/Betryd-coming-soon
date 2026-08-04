export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Please use POST.',
    });
  }

  // Parse request body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { name, email } = body || {};

  // Validate required email
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  // Read Brevo API Key strictly from environment variable
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey || brevoApiKey === 'your_brevo_api_key_here') {
    console.error('BREVO_API_KEY is missing or unconfigured in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: BREVO_API_KEY is not configured on Vercel.',
    });
  }

  // Parse name into FNAME / LNAME / FULLNAME attributes
  const trimmedName = name ? String(name).trim() : '';
  const nameParts = trimmedName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Determine Brevo List ID
  const listIdEnv = process.env.BREVO_LIST_ID;
  const listIds = listIdEnv && !isNaN(Number(listIdEnv)) ? [Number(listIdEnv)] : [2];

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        attributes: {
          FNAME: firstName || trimmedName || '',
          LNAME: lastName || '',
          FULLNAME: trimmedName || '',
        },
        listIds: listIds,
        updateEnabled: true,
      }),
    });

    if (brevoResponse.ok || brevoResponse.status === 201 || brevoResponse.status === 204) {
      return res.status(200).json({
        success: true,
        message: 'Successfully subscribed to Betryd Early Access!',
      });
    }

    const data = await brevoResponse.json().catch(() => ({}));

    // Handle existing duplicate contact gracefully as success
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({
        success: true,
        message: 'You are already registered for Betryd launch updates!',
      });
    }

    return res.status(brevoResponse.status || 400).json({
      success: false,
      message: data.message || 'Failed to register contact with Brevo.',
    });
  } catch (error) {
    console.error('Error connecting to Brevo API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while connecting to Brevo API.',
    });
  }
}
