export const serviceConfig = {
  // Service Discovery
  discovery: {
    enabled: true,
    provider: 'consul',
    refreshInterval: 30000, // 30 seconds
  },

  // Load Balancing
  loadBalancing: {
    strategy: 'round-robin',
    healthCheck: {
      enabled: true,
      interval: 20000,
      timeout: 5000,
      unhealthyThreshold: 3,
    }
  },

  // Circuit Breaker Configuration
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenRequests: 3,
  },

  // Rate Limiting
  rateLimit: {
    window: 60000, // 1 minute
    maxRequests: 100,
    userSpecific: {
      free: 50,
      basic: 100,
      premium: 300
    }
  },

  // Caching Strategy
  caching: {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      defaultTTL: 3600,
    },
    patterns: {
      courses: {
        ttl: 3600,
        invalidateOn: ['course:update', 'course:delete']
      },
      userProgress: {
        ttl: 300,
        invalidateOn: ['progress:update']
      }
    }
  },

  // Message Queue Configuration
  queue: {
    provider: 'rabbitmq',
    connection: process.env.RABBITMQ_URL,
    queues: {
      notifications: {
        name: 'user-notifications',
        options: { durable: true }
      },
      progress: {
        name: 'learning-progress',
        options: { durable: true }
      }
    }
  }
}