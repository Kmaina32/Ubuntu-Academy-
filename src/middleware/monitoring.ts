import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { monitoring } from '@/lib/monitoring'
import { logger } from '@/lib/logging'

export const config = {
  matcher: '/api/:path*'
}

export async function middleware(request: NextRequest) {
  const requestStart = Date.now()
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  // Add request ID to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  try {
    // Wait for the response
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })

    // Calculate request duration
    const duration = Date.now() - requestStart

    // Record metrics
    monitoring.recordHttpRequest(
      duration,
      request.method,
      request.nextUrl.pathname,
      response.status
    )

    // Add timing headers
    response.headers.set('Server-Timing', `total;dur=${duration}`)
    response.headers.set('X-Response-Time', `${duration}ms`)

    // Log request completion
    logger.info('API request completed', {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      duration,
      status: response.status
    })

    return response
  } catch (error) {
    // Record error metrics
    monitoring.recordHttpRequest(
      Date.now() - requestStart,
      request.method,
      request.nextUrl.pathname,
      500
    )

    // Log error
    logger.error('API request failed', error as Error, {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname
    })

    // Return error response
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}