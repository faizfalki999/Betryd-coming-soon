import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Please use POST.',
    });
  }

  // Check DATABASE_URL environment variable
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: DATABASE_URL is not configured.',
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

  const trimmedEmail = email.trim();
  const trimmedName = name ? String(name).trim() : '';

  try {
    const sql = neon(databaseUrl);

    // Ensure signups table exists
    await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Insert new signup row into signups table
    await sql`
      INSERT INTO signups (name, email, created_at)
      VALUES (${trimmedName}, ${trimmedEmail}, NOW());
    `;

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to Betryd Early Access!',
    });
  } catch (error) {
    console.error('Database insertion error:', error);

    // Handle duplicate email error (Postgres code 23505 or unique constraint error message)
    if (
      error?.code === '23505' ||
      (error?.message && error.message.toLowerCase().includes('unique')) ||
      (error?.message && error.message.toLowerCase().includes('duplicate'))
    ) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered for early access!',
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to save subscription to database.',
    });
  }
}
