import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token_hash, type, next = '/' } = req.query;

  if (!token_hash || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Verify the OTP
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token_hash as string,
      type: type as any,
    });

    if (error) {
      throw error;
    }

    // Redirect to the specified page or default to home
    res.redirect(302, next as string);
  } catch (error: any) {
    console.error('Auth confirmation error:', error);
    res.redirect(302, '/auth/error?error=verification_failed');
  }
}