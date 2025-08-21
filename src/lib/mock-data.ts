

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

export const user = {
    name: 'Jomo Kenyatta',
    purchasedCourses: [
        { courseId: 'digital-marketing-101', progress: 50, completed: false, certificateAvailable: false, completedLessons: [], enrollmentDate: '2024-01-01T12:00:00.000Z' },
        { courseId: 'graphic-design-canva', progress: 100, completed: true, certificateAvailable: true, completedLessons: [], enrollmentDate: '2024-01-01T12:00:00.000Z' }
    ]
}

export interface UserCourse {
    courseId: string;
    progress: number;
    completed: boolean;
    certificateAvailable: boolean;
    enrollmentDate: string; // ISO String
    completedLessons?: string[];
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
}
