

import { z } from 'zod';

export interface YoutubeLink {
  title: string;
  url: string;
}

export interface GoogleDriveLink {
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  title:string;
  duration: string;
  content: string;
  youtubeLinks?: YoutubeLink[];
  googleDriveLinks?: GoogleDriveLink[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface ShortAnswerQuestion {
  id: string;
  type: 'short-answer';
  question: string;
  referenceAnswer: string;
  maxPoints: number;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct answer
  maxPoints: number;
}

export type ExamQuestion = ShortAnswerQuestion | MultipleChoiceQuestion;


export interface Submission {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userEmail: string;
    courseTitle: string;
    submittedAt: string; // ISO String
    answers: { questionId: string, answer: string | number }[]; // string for short-answer, number for mcq index
    graded: boolean;
    pointsAwarded?: number;
    feedback?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  duration: string; // e.g., "5 Weeks"
  dripFeed: 'daily' | 'weekly' | 'off';
  modules: Module[];
  exam: ExamQuestion[];
  createdAt: string; // ISO string
}

export interface Program {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  certificateImageUrl: string;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  courseIds: string[];
  imageUrl: string;
}

export const user = {
    name: 'Jomo Kenyatta',
    purchasedCourses: [
        { courseId: 'digital-marketing-101', progress: 50, completed: false, certificateAvailable: false, completedLessons: [], enrollmentDate: '2024-01-01T12:00:00.000Z' },
        { courseId: 'graphic-design-canva', progress: 100, completed: true, certificateAvailable: true, completedLessons: [], enrollmentDate: '2024-0-01T12:00:00.000Z' }
    ]
}

export interface UserCourse {
    courseId: string;
    progress: number;
    completed: boolean;
    certificateAvailable: boolean;
    enrollmentDate: string; // ISO String
    completedLessons?: string[];
    feedbackSubmitted?: boolean;
}

export type TutorMessage = {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  suggestions?: string[];
};

export interface Notification {
    id: string;
    title: string;
    body: string;
    link?: string;
    createdAt: string;
    cohort?: string;
}

export interface DiscussionReply {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string; // ISO String
}

export interface DiscussionThread {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string; // ISO String
    replies?: DiscussionReply[];
}

export interface LiveSession {
    isActive: boolean;
    streamData: any; // This would hold the WebRTC signaling data
    title: string;
    description?: string;
    speakers?: string;
    target: 'all' | 'cohort' | 'students';
    cohort?: string;
    studentIds?: string[];
}

export interface UserContent {
    id: string;
    type: 'course' | 'program' | 'bundle';
    title: string;
    description: string;
    status: 'draft' | 'published';
}

export const ContentStrategyOutputSchema = z.object({
  coursesCreated: z.number(),
  programTitle: z.string(),
  bundleTitle: z.string(),
});
export type ContentStrategyOutput = z.infer<typeof ContentStrategyOutputSchema>;

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string; // ISO String
    userId: string;
}

export interface Portfolio {
    summary?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
}

export interface LearningGoal {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

export interface CourseFeedback {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Project {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    title: string;
    description: string;
    projectUrl: string;
    imageUrl: string;
    createdAt: string;
}

export interface RegisteredUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    createdAt?: string; // ISO String
    cohort?: string;
    purchasedCourses?: Record<string, Omit<UserCourse, 'courseId'>>;
    plan?: 'free' | 'basic' | 'pro';
    apiCallCount?: number;
    isAdmin?: boolean;
    adminExpiresAt?: string | null;
    isOnline?: boolean;
    lastSeen?: string | number;
    portfolio?: Portfolio;
    learningGoals?: Record<string, LearningGoal>;
}
