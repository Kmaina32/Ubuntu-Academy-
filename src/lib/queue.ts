import { Queue, Worker, QueueScheduler } from 'bullmq'
import { Redis } from 'ioredis'

const connection = new Redis(process.env.REDIS_URL)

// Queue definitions
export const queues = {
  notifications: new Queue('notifications', { connection }),
  progress: new Queue('progress', { connection }),
  analytics: new Queue('analytics', { connection }),
  exports: new Queue('exports', { connection })
}

// Job processors
const processors = {
  notifications: async (job: any) => {
    // Handle notification sending
    const { type, userId, message } = job.data
    // Implement notification logic
  },

  progress: async (job: any) => {
    // Handle progress updates and achievements
    const { userId, courseId, lessonId, progress } = job.data
    // Implement progress tracking logic
  },

  analytics: async (job: any) => {
    // Handle analytics processing
    const { event, metadata } = job.data
    // Implement analytics processing logic
  },

  exports: async (job: any) => {
    // Handle data exports (reports, certificates, etc.)
    const { type, data } = job.data
    // Implement export logic
  }
}

// Create workers
Object.entries(queues).forEach(([name, queue]) => {
  new Worker(name, processors[name as keyof typeof processors], { connection })
  new QueueScheduler(name, { connection })
})

// Queue options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnComplete: true
}

// Helper functions for adding jobs
export const queueJobs = {
  addNotification: async (data: any) => {
    await queues.notifications.add('send-notification', data, defaultJobOptions)
  },

  updateProgress: async (data: any) => {
    await queues.progress.add('update-progress', data, defaultJobOptions)
  },

  trackEvent: async (data: any) => {
    await queues.analytics.add('track-event', data, defaultJobOptions)
  },

  generateExport: async (data: any) => {
    await queues.exports.add('generate-export', data, {
      ...defaultJobOptions,
      timeout: 5 * 60 * 1000 // 5 minutes
    })
  }
}

// Monitoring and metrics
export const getQueueMetrics = async () => {
  const metrics: Record<string, any> = {}
  
  for (const [name, queue] of Object.entries(queues)) {
    metrics[name] = {
      waiting: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      completed: await queue.getCompletedCount(),
      failed: await queue.getFailedCount()
    }
  }
  
  return metrics
}