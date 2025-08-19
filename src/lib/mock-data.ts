

export interface YoutubeLink {
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  youtubeLinks?: YoutubeLink[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  courseTitle?: string; // Optional: for displaying in lists
}

export interface Submission {
    id: string;
    assignmentId: string;
    courseId: string;
    userId: string;
    userName: string;
    userEmail: string;
    assignmentTitle: string;
    courseTitle: string;
    submittedAt: string; // ISO String
    answer: string;
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
  modules: Module[];
  exam: {
    question: string;
    referenceAnswer: string;
    maxPoints: number;
  };
  assignments?: Record<string, Omit<Assignment, 'id' | 'courseId' | 'courseTitle'>>;
}

export const user = {
    name: 'Jomo Kenyatta',
    purchasedCourses: [
        { courseId: 'digital-marketing-101', progress: 50, completed: false, certificateAvailable: false, completedLessons: [] },
        { courseId: 'graphic-design-canva', progress: 100, completed: true, certificateAvailable: true, completedLessons: [] }
    ]
}

export interface UserCourse {
    courseId: string;
    progress: number;
    completed: boolean;
    certificateAvailable: boolean;
    completedLessons?: string[];
}
