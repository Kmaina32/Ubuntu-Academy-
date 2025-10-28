import { z } from 'zod'

// Database Sharding Configuration
export const shardConfig = {
  enabled: true,
  strategy: 'hash',
  shards: 4,
  shardKey: 'userId'
}

// Data Models with Validation
export const schemas = {
  course: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    instructor: z.string(),
    modules: z.array(z.object({
      id: z.string(),
      title: z.string(),
      lessons: z.array(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        duration: z.number(),
        resources: z.array(z.object({
          type: z.enum(['video', 'document', 'quiz']),
          url: z.string(),
          title: z.string()
        }))
      }))
    })),
    pricing: z.object({
      amount: z.number(),
      currency: z.string(),
      interval: z.enum(['one-time', 'monthly', 'yearly'])
    }),
    metadata: z.object({
      createdAt: z.date(),
      updatedAt: z.date(),
      publishedAt: z.date().optional(),
      status: z.enum(['draft', 'published', 'archived']),
      tags: z.array(z.string()),
      language: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced'])
    })
  }),

  userProgress: z.object({
    userId: z.string(),
    courseId: z.string(),
    progress: z.number().min(0).max(100),
    completedLessons: z.array(z.string()),
    quizScores: z.record(z.string(), z.number()),
    timeSpent: z.number(),
    lastAccessedAt: z.date(),
    certificate: z.object({
      issued: z.boolean(),
      issuedAt: z.date().optional(),
      url: z.string().optional()
    })
  }),

  analytics: z.object({
    eventType: z.enum([
      'lesson_started',
      'lesson_completed',
      'quiz_attempted',
      'video_watched',
      'certificate_earned'
    ]),
    userId: z.string(),
    courseId: z.string(),
    timestamp: z.date(),
    metadata: z.record(z.string(), z.unknown())
  })
}

// Indexing Strategy
export const indices = {
  courses: [
    { fields: ['slug'], unique: true },
    { fields: ['instructor', 'status'] },
    { fields: ['metadata.tags'] },
    { fields: ['metadata.createdAt'] }
  ],
  userProgress: [
    { fields: ['userId', 'courseId'], unique: true },
    { fields: ['lastAccessedAt'] }
  ],
  analytics: [
    { fields: ['timestamp'] },
    { fields: ['userId', 'eventType'] },
    { fields: ['courseId', 'eventType'] }
  ]
}

// Partitioning Strategy
export const partitionConfig = {
  analytics: {
    type: 'time-based',
    interval: 'monthly',
    retention: {
      raw: '3 months',
      aggregated: '2 years'
    }
  }
}