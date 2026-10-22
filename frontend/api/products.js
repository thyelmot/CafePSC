import { getSupabaseClient, getAdminSupabaseClient } from '../lib/supabase.js';
import { rateLimit } from '../lib/rateLimit.js';

export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Rate limiting để chống scraping
    const rateLimitCheck = rateLimit(req, '/api/products');
    if (!rateLimitCheck.allowed) {
      res.setHeader('Retry-After', rateLimitCheck.retryAfter);
      return res.status(429).json({ 
        error: rateLimitCheck.error || 'Too many requests. Please try again later.' 
      });
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error) throw error;

      // Tự động kiểm tra và khởi tạo món Dây thẻ nếu chưa có trong DB Supabase
      const hasMerch = (data || []).some(p => p.name === 'Dây thẻ');
      if (!hasMerch) {
        try {
          const adminSupabase = getAdminSupabaseClient();
          const { data: newMerch, error: merchErr } = await adminSupabase
            .from('products')
            .insert([{
              name: 'Dây thẻ',
              price: 30000,
              category: 'merch',
              is_available: true,
              sizes: []
            }])
            .select();
          
          if (!merchErr && newMerch && newMerch.length > 0) {
            data.push(...newMerch);
          }
        } catch (e) {
          console.warn('Auto-seed merch warning:', e.message);
        }
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
