

import { db } from './firebase';
import { ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import type { Course, UserCourse, Assignment, CalendarEvent, Submission } from './mock-data';

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
    loginImageUrl: string;
    signupImageUrl: string;
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

export async function updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    const courseRef = ref(db, `courses/${courseId}`);
    await update(courseRef, courseData);
}


export async function deleteCourse(courseId: string): Promise<void> {
    const courseRef = ref(db, `courses/${courseId}`);
    await remove(courseRef);
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
        completedLessons: [],
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

export async function updateUserCourseProgress(userId: string, courseId: string, data: Partial<Omit<UserCourse, 'courseId'>>) {
    const progressRef = ref(db, `users/${userId}/purchasedCourses/${courseId}`);
    await update(progressRef, data);
}


export async function getAllUsers(): Promise<RegisteredUser[]> {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(snapshot.val()).map(uid => ({
            ...usersData[uid],
            uid: uid
        }));
    }
    return [];
}

export async function deleteUser(userId: string): Promise<void> {
    const userRef = ref(db, `users/${userId}`);
    await remove(userRef);
}


// Hero Section Functions
export async function getHeroData(): Promise<HeroData> {
    const heroRef = ref(db, 'hero');
    const snapshot = await get(heroRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure all fields are present, providing defaults if they are not
        return {
            title: data.title || 'Unlock Your Potential.',
            subtitle: data.subtitle || 'Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.',
            imageUrl: data.imageUrl || 'https://placehold.co/1200x400.png',
            loginImageUrl: data.loginImageUrl || 'https://placehold.co/1200x900.png',
            signupImageUrl: data.signupImageUrl || 'https://placehold.co/1200x900.png'
        };
    }
    return {
        title: 'Unlock Your Potential.',
        subtitle: 'Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.',
        imageUrl: 'https://placehold.co/1200x400.png',
        loginImageUrl: 'https://placehold.co/1200x900.png',
        signupImageUrl: 'https://placehold.co/1200x900.png'
    };
}

export async function saveHeroData(data: Partial<HeroData>): Promise<void> {
    const heroRef = ref(db, 'hero');
    await update(heroRef, data);
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

export async function deleteCalendarEvent(eventId: string): Promise<void> {
    const eventRef = ref(db, `calendarEvents/${eventId}`);
    await remove(eventRef);
}

// Submission Functions
export async function createSubmission(submissionData: Omit<Submission, 'id'>): Promise<string> {
    const submissionsRef = ref(db, 'submissions');
    const newSubmissionRef = push(submissionsRef);
    await set(newSubmissionRef, submissionData);
    return newSubmissionRef.key!;
}

export async function getSubmissionsByUserId(userId: string): Promise<Submission[]> {
    const submissionsRef = query(ref(db, 'submissions'), orderByChild('userId'), equalTo(userId));
    const snapshot = await get(submissionsRef);
    if (snapshot.exists()) {
        const submissionsData = snapshot.val();
        return Object.keys(submissionsData).map(key => ({
            id: key,
            ...submissionsData[key],
        }));
    }
    return [];
}

export async function getAllSubmissions(): Promise<Submission[]> {
    const submissionsRef = ref(db, 'submissions');
    const snapshot = await get(submissionsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissionRef = ref(db, `submissions/${id}`);
    const snapshot = await get(submissionRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function updateSubmission(id: string, data: Partial<Submission>): Promise<void> {
    const submissionRef = ref(db, `submissions/${id}`);
    await update(submissionRef, data);
}
