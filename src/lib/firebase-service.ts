

import { db, storage } from './firebase';
import { ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Course, UserCourse, CalendarEvent, Submission, TutorMessage, Notification } from './mock-data';
import { getRemoteConfig, fetchAndActivate, getString, getValue } from 'firebase/remote-config';
import { app } from './firebase';


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
    slideshowSpeed: number;
    imageBrightness: number;
    recaptchaEnabled: boolean;
    theme?: string;
}

export interface TutorSettings {
    voice: string;
    speed: number;
    prompts?: string;
}

// Image Upload Service
export async function uploadImage(userId: string, file: File): Promise<string> {
    const filePath = `profile-pictures/${userId}/${file.name}`;
    const imageRef = storageRef(storage, filePath);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
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
        createdAt: new Date().toISOString(), // Add creation timestamp
        modules: courseData.modules || [],
        exam: courseData.exam || [],
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
    // We only want to store non-sensitive, profile-related info
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        purchasedCourses: user.purchasedCourses || {}
    };
    await set(userRef, userData);
}

export async function getUserById(uid: string): Promise<RegisteredUser | null> {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return snapshot.val() as RegisteredUser;
    }
    return null;
}


export async function enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    const enrollmentRef = ref(db, `users/${userId}/purchasedCourses/${courseId}`);
    await set(enrollmentRef, {
        progress: 0,
        completed: false,
        certificateAvailable: false,
        completedLessons: [],
        enrollmentDate: new Date().toISOString(), // Set enrollment date
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
        return Object.keys(usersData).map(uid => ({
            uid,
            ...usersData[uid],
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
    const defaults: HeroData = {
        title: 'Unlock Your Potential.',
        subtitle: 'Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.',
        imageUrl: 'https://placehold.co/1200x400.png',
        loginImageUrl: 'https://placehold.co/1200x900.png',
        signupImageUrl: 'https://placehold.co/1200x900.png',
        slideshowSpeed: 5,
        imageBrightness: 60, // Represents 60% brightness (40% overlay opacity)
        recaptchaEnabled: true,
        theme: 'default',
    };
    
    // Fetch remote config values
    const remoteConfig = getRemoteConfig(app);
    await fetchAndActivate(remoteConfig);

    const remoteTitle = getString(remoteConfig, 'hero_title');
    const remoteSubtitle = getString(remoteConfig, 'hero_subtitle');


    if (snapshot.exists()) {
        const data = snapshot.val();
        return {
            ...defaults,
            ...data,
            title: remoteTitle || data.title,
            subtitle: remoteSubtitle || data.subtitle,
        };
    }

    return {
        ...defaults,
        title: remoteTitle || defaults.title,
        subtitle: remoteSubtitle || defaults.subtitle,
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

// Tutor History Functions
export async function saveTutorHistory(
  userId: string,
  courseId: string,
  lessonId: string,
  messages: TutorMessage[]
): Promise<void> {
  const historyRef = ref(db, `tutorHistory/${userId}/${courseId}/${lessonId}`);
  await set(historyRef, messages);
}

export async function getTutorHistory(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<TutorMessage[]> {
  const historyRef = ref(db, `tutorHistory/${userId}/${courseId}/${lessonId}`);
  const snapshot = await get(historyRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return [];
}

// Tutor Settings Functions
export async function saveTutorSettings(settings: TutorSettings): Promise<void> {
    const settingsRef = ref(db, 'tutorSettings');
    await set(settingsRef, settings);
}

export async function getTutorSettings(): Promise<TutorSettings> {
    const settingsRef = ref(db, 'tutorSettings');
    const snapshot = await get(settingsRef);
    const defaults: TutorSettings = {
        voice: 'algenib',
        speed: 1.0,
        prompts: "Welcome! To talk with me, your virtual tutor, just click the chat button.\nHow can I help you with this lesson?",
    };
    if (snapshot.exists()) {
        return { ...defaults, ...snapshot.val() };
    }
    return defaults;
}

// Remote Config Functions
export async function getRemoteConfigValues(keys: string[]): Promise<Record<string, string>> {
    const remoteConfig = getRemoteConfig(app);
    await fetchAndActivate(remoteConfig);
    
    const configValues: Record<string, string> = {};
    keys.forEach(key => {
        configValues[key] = getString(remoteConfig, key);
    });
    return configValues;
}

export async function saveRemoteConfigValues(data: Record<string, string>): Promise<void> {
    // Note: This is a client-side mock. In a real app, you'd use the Admin SDK on a server.
    // We will save to RTDB as a stand-in for this demo.
    const remoteConfigRef = ref(db, 'remoteConfig');
    await update(remoteConfigRef, data);
    console.log("Remote config values saved to RTDB for demo purposes:", data);
}


// Notification Functions
export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const notificationsRef = ref(db, 'notifications');
    const newNotificationRef = push(notificationsRef);
    const dataToSave = {
        ...notificationData,
        createdAt: new Date().toISOString(),
    };
    await set(newNotificationRef, dataToSave);
    return newNotificationRef.key!;
}

export async function getAllNotifications(): Promise<Notification[]> {
    const notificationsRef = ref(db, 'notifications');
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        return Object.keys(notificationsData).map(key => ({
            id: key,
            ...notificationsData[key]
        }));
    }
    return [];
}
