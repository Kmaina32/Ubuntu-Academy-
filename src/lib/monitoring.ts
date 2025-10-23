import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { logger } from './logging'

// Initialize Prometheus exporter
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics'
})

// Create meter provider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ubuntu-academy'
  })
})

// Add Prometheus exporter to meter provider
meterProvider.addMetricReader(prometheusExporter)

// Create meters for different aspects of the application
const systemMeter = meterProvider.getMeter('system')
const applicationMeter = meterProvider.getMeter('application')
const userMeter = meterProvider.getMeter('user')

// System Metrics
const systemMemoryUsage = systemMeter.createUpDownCounter('system.memory.usage', {
  description: 'Memory usage of the application'
})

const systemCpuUsage = systemMeter.createUpDownCounter('system.cpu.usage', {
  description: 'CPU usage of the application'
})

// Application Metrics
const httpRequestDuration = applicationMeter.createHistogram('http.request.duration', {
  description: 'Duration of HTTP requests',
  unit: 'milliseconds'
})

const httpRequestTotal = applicationMeter.createCounter('http.request.total', {
  description: 'Total number of HTTP requests'
})

const httpErrorTotal = applicationMeter.createCounter('http.error.total', {
  description: 'Total number of HTTP errors'
})

// User Metrics
const activeUsers = userMeter.createUpDownCounter('user.active', {
  description: 'Number of active users'
})

const userEngagement = userMeter.createHistogram('user.engagement', {
  description: 'User engagement duration',
  unit: 'seconds'
})

// Monitoring functions
export const monitoring = {
  // System monitoring
  recordMemoryUsage: () => {
    const usage = process.memoryUsage()
    systemMemoryUsage.add(usage.heapUsed)
    logger.debug('Memory usage recorded', { heapUsed: usage.heapUsed })
  },

  recordCpuUsage: () => {
    const usage = process.cpuUsage()
    systemCpuUsage.add(usage.user)
    logger.debug('CPU usage recorded', { cpuUsage: usage.user })
  },

  // HTTP monitoring
  recordHttpRequest: (duration: number, method: string, path: string, status: number) => {
    httpRequestDuration.record(duration, { method, path })
    httpRequestTotal.add(1, { method, path })
    
    if (status >= 400) {
      httpErrorTotal.add(1, { method, path, status: status.toString() })
    }
    
    logger.info('HTTP request recorded', { duration, method, path, status })
  },

  // User monitoring
  recordActiveUser: (increment: boolean = true) => {
    activeUsers.add(increment ? 1 : -1)
    logger.debug(`Active user ${increment ? 'added' : 'removed'}`)
  },

  recordUserEngagement: (duration: number, userId: string, activityType: string) => {
    userEngagement.record(duration, { userId, activityType })
    logger.debug('User engagement recorded', { duration, userId, activityType })
  }
}

// Alert thresholds
export const alertThresholds = {
  memory: {
    warning: 1024 * 1024 * 1024, // 1GB
    critical: 2 * 1024 * 1024 * 1024 // 2GB
  },
  errorRate: {
    warning: 0.05, // 5%
    critical: 0.10 // 10%
  },
  responseTime: {
    warning: 1000, // 1 second
    critical: 3000 // 3 seconds
  }
}

// Alert check function
export const checkAlerts = async () => {
  try {
    // Check memory usage
    const memoryUsage = process.memoryUsage().heapUsed
    if (memoryUsage > alertThresholds.memory.critical) {
      logger.error('Critical memory usage detected', { memoryUsage })
      // Trigger alert (implement your alert mechanism)
    } else if (memoryUsage > alertThresholds.memory.warning) {
      logger.warn('High memory usage detected', { memoryUsage })
    }

    // Check error rate
    const metrics = await prometheusExporter.getMetricSnapshotSync()
    const errorRate = calculateErrorRate(metrics)
    if (errorRate > alertThresholds.errorRate.critical) {
      logger.error('Critical error rate detected', { errorRate })
      // Trigger alert
    } else if (errorRate > alertThresholds.errorRate.warning) {
      logger.warn('High error rate detected', { errorRate })
    }
  } catch (error) {
    logger.error('Failed to check alerts', error as Error)
  }
}

// Helper function to calculate error rate
const calculateErrorRate = (metrics: any) => {
  const totalRequests = metrics.get('http.request.total')?.value || 0
  const totalErrors = metrics.get('http.error.total')?.value || 0
  return totalRequests > 0 ? totalErrors / totalRequests : 0
}

// Start periodic monitoring
export const startMonitoring = () => {
  // Record system metrics every minute
  setInterval(() => {
    monitoring.recordMemoryUsage()
    monitoring.recordCpuUsage()
  }, 60000)

  // Check alerts every 5 minutes
  setInterval(checkAlerts, 300000)

  logger.info('Monitoring system started')
}