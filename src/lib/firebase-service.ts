
import { db } from './firebase';
import { ref, get, set, push } from 'firebase/database';
import type { Course } from './mock-data';

export async function getAllCourses(): Promise<Course[]> {
  const coursesRef = ref(db, 'courses');
  const snapshot = await get(coursesRef);
  if (snapshot.exists()) {
    const coursesData = snapshot.val();
    return Object.keys(coursesData).map(key => ({
      id: key,
      ...coursesData[key]
    }));
  }
  return [];
}

export async function getCourseById(id: string): Promise<Course | null> {
    const courseRef = ref(db, `courses/${id}`);
    const snapshot = await get(courseRef);
    if(snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}


export async function createCourse(courseData: Omit<Course, 'id'>): Promise<string> {
    const coursesRef = ref(db, 'courses');
    const newCourseRef = push(coursesRef);
    // The data to be saved should not contain the id, as it's the key.
    const dataToSave = {
        ...courseData,
        modules: courseData.modules || [],
        exam: courseData.exam || { question: '', referenceAnswer: '', maxPoints: 10},
        imageUrl: courseData.imageUrl || 'https://placehold.co/600x400'
    };
    await set(newCourseRef, dataToSave);
    return newCourseRef.key!;
}
