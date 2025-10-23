import { NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'
import { logger } from '@/lib/logging'
import { redis } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get system metrics
    const systemMetrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    }

    // Get cache metrics
    const cacheStats = await redis.info('stats')

    // Get application metrics from monitoring system
    const appMetrics = await monitoring.getMetricSnapshotSync()

    // Aggregate metrics
    const metrics = {
      system: {
        memory: {
          used: systemMetrics.memory.heapUsed,
          total: systemMetrics.memory.heapTotal,
          external: systemMetrics.memory.external,
          utilization: (systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) * 100
        },
        cpu: {
          user: systemMetrics.cpu.user,
          system: systemMetrics.cpu.system
        },
        uptime: systemMetrics.uptime
      },
      application: {
        requests: {
          total: appMetrics.get('http.request.total')?.value || 0,
          errors: appMetrics.get('http.error.total')?.value || 0,
          averageLatency: appMetrics.get('http.request.duration')?.value || 0
        },
        users: {
          active: appMetrics.get('user.active')?.value || 0,
          engagement: appMetrics.get('user.engagement')?.value || 0
        }
      },
      cache: {
        hits: parseInt(cacheStats.get('keyspace_hits') || '0'),
        misses: parseInt(cacheStats.get('keyspace_misses') || '0'),
        hitRate: calculateHitRate(
          parseInt(cacheStats.get('keyspace_hits') || '0'),
          parseInt(cacheStats.get('keyspace_misses') || '0')
        )
      }
    }

    logger.info('Dashboard metrics retrieved successfully')
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to retrieve dashboard metrics', error as Error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve metrics'
      },
      { status: 500 }
    )
  }
}

function calculateHitRate(hits: number, misses: number): number {
  const total = hits + misses
  return total > 0 ? (hits / total) * 100 : 0
}