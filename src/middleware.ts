import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis safely
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fixed window limiter: 10 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(10, '24 h'),
      ephemeralCache: new Map(),
      analytics: false,
    })
  : null;

export async function middleware(request: NextRequest) {
  // Only apply to POST /api/salaries
  if (request.nextUrl.pathname === '/api/salaries' && request.method === 'POST') {
    // Fail-open policy if Redis is not configured
    if (!ratelimit) {
      console.warn('Rate limiter bypassed: UPSTASH variables not configured.');
      return NextResponse.next();
    }

    try {
      // Extract IP (Next.js request.ip -> x-forwarded-for -> fallback)
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown-ip';
      const identifier = `ratelimit:salary:${ip}`;

      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    } catch (error) {
      // Fail-open policy if Redis times out or throws
      console.error('Redis Rate Limiting Error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/salaries',
};
