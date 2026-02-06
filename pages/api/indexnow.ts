import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * IndexNow API Route
 * 
 * Purpose: Notify search engines (Bing, Google, Yandex) when content is updated
 * Protocol: https://www.indexnow.org/documentation
 * 
 * Usage:
 * POST /api/indexnow
 * Body: { "urls": ["https://www.globalpass.tech/esim/japan", "https://www.globalpass.tech/"] }
 * 
 * Response: { "success": true, "submitted": 2, "engines": ["bing", "yandex"] }
 */

// IndexNow API key (32-character hexadecimal)
// This key must be hosted at /public/{key}.txt for verification
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '1c5a12be67d72194611768e48696d46a';

// Search engine endpoints
const SEARCH_ENGINES = [
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  // Note: Google doesn't officially support IndexNow yet, but may in the future
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: urls array is required' 
      });
    }

    // Validate URLs (must be from globalpass.tech)
    const validUrls = urls.filter((url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'www.globalpass.tech' || 
               urlObj.hostname === 'globalpass.tech' ||
               urlObj.hostname === 'globalpass.vercel.app';
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return res.status(400).json({ error: 'No valid URLs found' });
    }

    // Prepare IndexNow payload
    const payload = {
      host: 'www.globalpass.tech',
      key: INDEXNOW_KEY,
      urlList: validUrls,
    };

    // Submit to search engines
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(async (engine) => {
        const response = await fetch(engine, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`${engine}: ${response.status} ${response.statusText}`);
        }

        return { engine, status: response.status };
      })
    );

    // Collect successful submissions
    const successful = results
      .filter((result) => result.status === 'fulfilled')
      .map((result: any) => result.value.engine);

    const failed = results
      .filter((result) => result.status === 'rejected')
      .map((result: any) => result.reason.message);

    return res.status(200).json({
      success: true,
      submitted: validUrls.length,
      urls: validUrls,
      engines: successful,
      errors: failed.length > 0 ? failed : undefined,
    });
  } catch (error: any) {
    console.error('IndexNow Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Unknown error' 
    });
  }
}
