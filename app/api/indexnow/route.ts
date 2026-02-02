import { NextRequest, NextResponse } from 'next/server';

/**
 * IndexNow API Route
 * 
 * Purpose: Notify search engines (Bing, Google, Yandex) when content is updated
 * Protocol: https://www.indexnow.org/documentation
 * 
 * Usage:
 * POST /api/indexnow
 * Body: { "urls": ["https://globalpass.vercel.app/esim", "https://globalpass.vercel.app/"] }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: urls array is required' },
        { status: 400 }
      );
    }

    // Validate URLs (must be from globalpass.vercel.app)
    const validUrls = urls.filter((url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'globalpass.vercel.app' || urlObj.hostname === 'www.globalpass.vercel.app';
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs found' },
        { status: 400 }
      );
    }

    // Prepare IndexNow payload
    const payload = {
      host: 'globalpass.vercel.app',
      key: INDEXNOW_KEY,
      urlList: validUrls,
    };

    // Submit to all search engines
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(async (engine) => {
        const response = await fetch(engine, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        return {
          engine: new URL(engine).hostname,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    // Process results
    const successful = results
      .filter((r) => r.status === 'fulfilled' && r.value.ok)
      .map((r) => (r.status === 'fulfilled' ? r.value.engine : ''));

    const failed = results
      .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
      .map((r) => (r.status === 'fulfilled' ? r.value.engine : 'unknown'));

    return NextResponse.json({
      success: successful.length > 0,
      submitted: validUrls.length,
      engines: {
        successful,
        failed,
      },
      urls: validUrls,
    });
  } catch (error) {
    console.error('IndexNow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'IndexNow API is ready',
    key: INDEXNOW_KEY,
    keyFile: `https://globalpass.vercel.app/${INDEXNOW_KEY}.txt`,
    usage: 'POST /api/indexnow with { "urls": ["https://globalpass.vercel.app/esim"] }',
  });
}
