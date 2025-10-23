import pino from 'pino'
import { v4 as uuidv4 } from 'uuid'

// Configure log levels and their numerical values
export const LogLevel = {
  TRACE: 10,
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  FATAL: 60
} as const

// Configure environments
const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

// Create the logger instance
export const logger = pino({
  level: isDev ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },
  transport: isProd
    ? {
        target: 'pino/file',
        options: { destination: './logs/app.log' }
      }
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname'
        }
      }
})

// Request context tracking
const requestContext = new AsyncLocalStorage<{
  requestId: string;
  userId?: string;
  sessionId?: string;
}>()

// Create a context wrapper for HTTP requests
export const withRequestContext = (
  handler: (req: NextRequest, context: any) => Promise<Response>
) => {
  return async (req: NextRequest, context: any) => {
    const requestId = req.headers.get('x-request-id') || uuidv4()
    const userId = req.headers.get('x-user-id')
    const sessionId = req.headers.get('x-session-id')

    return await requestContext.run(
      { requestId, userId, sessionId },
      async () => {
        try {
          const response = await handler(req, context)
          return response
        } catch (error) {
          logError('Request failed', error, { url: req.url })
          throw error
        }
      }
    )
  }
}

// Logging helper functions
export const logInfo = (message: string, data?: any) => {
  const context = requestContext.getStore()
  logger.info({ ...context, ...data }, message)
}

export const logError = (message: string, error: Error, data?: any) => {
  const context = requestContext.getStore()
  logger.error(
    {
      ...context,
      ...data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    },
    message
  )
}

export const logWarning = (message: string, data?: any) => {
  const context = requestContext.getStore()
  logger.warn({ ...context, ...data }, message)
}

export const logDebug = (message: string, data?: any) => {
  const context = requestContext.getStore()
  logger.debug({ ...context, ...data }, message)
}

// Performance monitoring
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logInfo(`Performance measurement: ${name}`, { duration })
    return result
  } catch (error) {
    const duration = performance.now() - start
    logError(`Performance measurement failed: ${name}`, error as Error, { duration })
    throw error
  }
}