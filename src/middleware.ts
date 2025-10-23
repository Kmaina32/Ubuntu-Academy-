import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export const config = {
  matcher: [
    '/api/courses/:path*',
    '/api/users/:path*'
  ]
}

const CACHE_CONFIG = {
  ttl: 60 * 60, // 1 hour
  excludedPaths: ['/api/courses/create', '/api/courses/update'],
  bypassHeader: 'x-bypass-cache',
  varyBy: ['auth', 'query']
}

export async function middleware(request: NextRequest) {
  // Skip caching for excluded paths and non-GET requests
  if (
    CACHE_CONFIG.excludedPaths.includes(request.nextUrl.pathname) ||
    request.method !== 'GET' ||
    request.headers.get(CACHE_CONFIG.bypassHeader)
  ) {
    return NextResponse.next()
  }

  // Generate cache key based on path, auth state, and query params
  const user = request.headers.get('x-user-id')
  const queryString = request.nextUrl.search
  const cacheKey = `cache:${request.nextUrl.pathname}:${user || 'anonymous'}:${queryString}`

  try {
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(JSON.stringify(cached), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      })
    }

    // If not in cache, proceed with request
    const response = await NextResponse.next()
    const data = await response.json()

    // Cache the response
    await redis.set(cacheKey, data, {
      ex: CACHE_CONFIG.ttl
    })

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    // On cache error, proceed without caching
    console.error('Cache error:', error)
    return NextResponse.next()
  }
}