
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  modules: Module[];
  exam: {
    question: string;
    referenceAnswer: string;
    maxPoints: number;
  }
}

export const user = {
    name: 'Jomo Kenyatta',
    purchasedCourses: [
        { courseId: 'digital-marketing-101', progress: 50, completed: false, certificateAvailable: false },
        { courseId: 'graphic-design-canva', progress: 100, completed: true, certificateAvailable: true }
    ]
}

export type UserCourse = typeof user.purchasedCourses[0];
