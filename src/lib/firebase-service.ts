

import { db } from './firebase';
import { ref, get, set, push, update, remove } from 'firebase/database';
import type { Course, UserCourse, Assignment, CalendarEvent } from './mock-data';

export interface RegisteredUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    purchasedCourses?: Record<string, Omit<UserCourse, 'courseId'>>;
}

export interface HeroData {
    title: string;
    subtitle: string;
    imageUrl: string;
}

// Course Functions
export async function getAllCourses(): Promise<Course[]> {
  const coursesRef = ref(db, 'courses');
  const snapshot = await get(coursesRef);
  if (snapshot.exists()) {
    const coursesData = snapshot.val();
    const courses = Object.keys(coursesData).map(key => ({
      id: key,
      ...coursesData[key]
    }));
    return courses.reverse();
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
    const dataToSave = {
        ...courseData,
        modules: courseData.modules || [],
        exam: courseData.exam || { question: 'Placeholder question', referenceAnswer: 'Placeholder answer', maxPoints: 10},
        imageUrl: courseData.imageUrl || 'https://placehold.co/600x400'
    };
    await set(newCourseRef, dataToSave);
    return newCourseRef.key!;
}

// User Functions
export async function saveUser(user: RegisteredUser): Promise<void> {
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, user);
}

export async function enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    const enrollmentRef = ref(db, `users/${userId}/purchasedCourses/${courseId}`);
    await set(enrollmentRef, {
        progress: 0,
        completed: false,
        certificateAvailable: false,
    });
}

export async function getUserCourses(userId: string): Promise<UserCourse[]> {
    const userCoursesRef = ref(db, `users/${userId}/purchasedCourses`);
    const snapshot = await get(userCoursesRef);
    if (snapshot.exists()) {
        const coursesData = snapshot.val();
        return Object.keys(coursesData).map(courseId => ({
            courseId,
            ...coursesData[courseId]
        }));
    }
    return [];
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

// Hero Section Functions
export async function getHeroData(): Promise<HeroData> {
    const heroRef = ref(db, 'hero');
    const snapshot = await get(heroRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return {
        title: 'Unlock Your Potential.',
        subtitle: 'Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.',
        imageUrl: 'https://placehold.co/1200x400.png'
    };
}

export async function saveHeroData(data: HeroData): Promise<void> {
    const heroRef = ref(db, 'hero');
    await set(heroRef, data);
}

// Assignment Functions
export async function createAssignment(courseId: string, assignmentData: Omit<Assignment, 'id' | 'courseId'>): Promise<string> {
    const assignmentsRef = ref(db, `courses/${courseId}/assignments`);
    const newAssignmentRef = push(assignmentsRef);
    await set(newAssignmentRef, assignmentData);
    return newAssignmentRef.key!;
}

export async function getAllAssignments(): Promise<Assignment[]> {
    const courses = await getAllCourses();
    let allAssignments: Assignment[] = [];
    for (const course of courses) {
        if (course.assignments) {
            const courseAssignments = Object.keys(course.assignments).map(key => ({
                ...course.assignments[key],
                id: key,
                courseId: course.id,
                courseTitle: course.title,
            }));
            allAssignments = [...allAssignments, ...courseAssignments];
        }
    }
    return allAssignments;
}

export async function updateAssignment(courseId: string, assignmentId: string, assignmentData: Partial<Assignment>): Promise<void> {
    const assignmentRef = ref(db, `courses/${courseId}/assignments/${assignmentId}`);
    // Omit id and courseId from the update payload
    const { id, courseId: cid, ...dataToUpdate } = assignmentData;
    await update(assignmentRef, dataToUpdate);
}

export async function deleteAssignment(courseId: string, assignmentId: string): Promise<void> {
    const assignmentRef = ref(db, `courses/${courseId}/assignments/${assignmentId}`);
    await remove(assignmentRef);
}


// Calendar Event Functions
export async function createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<string> {
    const eventsRef = ref(db, 'calendarEvents');
    const newEventRef = push(eventsRef);
    await set(newEventRef, eventData);
    return newEventRef.key!;
}

export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
    const eventsRef = ref(db, 'calendarEvents');
    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
        const eventsData = snapshot.val();
        return Object.keys(eventsData).map(key => ({
            id: key,
            ...eventsData[key]
        }));
    }
    return [];
}
