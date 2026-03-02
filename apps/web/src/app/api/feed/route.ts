/**
 * Next.js route handler that proxies feed requests to the Buzzy API.
 * This runs server-side, so it can reach the API without CORS or
 * client-side env var issues.
 *
 * @module @buzzy/web/app/api/feed/route
 */

import { NextResponse, type NextRequest } from 'next/server';
import { API_URL } from '@/services/api';

/**
 * Proxies GET requests to the Buzzy API feed endpoint.
 *
 * @param request - Incoming Next.js request
 * @returns Proxied JSON response
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();

  const limit = searchParams.get('limit');
  const category = searchParams.get('category');
  const cursor = searchParams.get('cursor');

  if (limit) params.set('limit', limit);
  if (category) params.set('category', category);
  if (cursor) params.set('cursor', cursor);

  try {
    const res = await fetch(`${API_URL}/api/articles/feed?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `API error ${res.status}` },
        { status: res.status },
      );
    }

    const data: unknown = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch feed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
