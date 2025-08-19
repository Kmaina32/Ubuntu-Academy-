
import { db } from './firebase';
import { ref, get, set, push } from 'firebase/database';
import type { Course } from './mock-data';

export interface RegisteredUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

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
        exam: courseData.exam || { question: 'Placeholder question', referenceAnswer: 'Placeholder answer', maxPoints: 10},
        imageUrl: courseData.imageUrl || 'https://placehold.co/600x400'
    };
    await set(newCourseRef, dataToSave);
    return newCourseRef.key!;
}

export async function saveUser(user: RegisteredUser): Promise<void> {
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, user);
}

export async function getAllUsers(): Promise<RegisteredUser[]> {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.values(usersData);
    }
    return [];
}
