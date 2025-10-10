

import { db, storage } from './firebase';
import { ref, get, set, push, update, remove, query, orderByChild, equalTo, increment } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Course, UserCourse, CalendarEvent, Submission, TutorMessage, Notification, DiscussionThread, DiscussionReply, LiveSession, Program, Bundle, ApiKey, Project, LearningGoal, CourseFeedback, Portfolio, PermissionRequest, Organization, Invitation, RegisteredUser, Bootcamp, PricingPlan, ProjectSubmission, Hackathon, HackathonSubmission, LeaderboardEntry } from './types';
import { getRemoteConfig, fetchAndActivate, getString } from 'firebase/remote-config';
import { app } from './firebase';

export type { RegisteredUser } from './types';


export interface HeroData {
    title: string;
    subtitle: string;
    imageUrl: string;
    programsImageUrl?: string;
    bootcampsImageUrl?: string;
    hackathonsImageUrl?: string;
    loginImageUrl: string;
    signupImageUrl: string;
    slideshowSpeed: number;
    imageBrightness: number;
    recaptchaEnabled: boolean;
    theme?: string;
    animationsEnabled?: boolean;
    orgHeroTitle?: string;
    orgHeroSubtitle?: string;
    orgHeroImageUrl?: string;
    orgLoginImageUrl?: string;
    orgSignupImageUrl?: string;
}

export interface TutorSettings {
    voice: string;
    speed: number;
    prompts?: string;
    avatarUrl?: string;
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
        createdAt: new Date().toISOString(),
        modules: courseData.modules || [],
        exam: courseData.exam || [],
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
export async function saveUser(uid: string, userData: Partial<Omit<RegisteredUser, 'uid'>>): Promise<void> {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, userData);

    // Denormalize data for public profiles
    if (userData.portfolio) {
        const publicProfileRef = ref(db, `publicProfiles/${uid}`);
        if (userData.portfolio.public) {
            await set(publicProfileRef, {
                uid: uid,
                displayName: userData.displayName,
                photoURL: userData.photoURL,
                portfolio: userData.portfolio
            });
        } else {
            await remove(publicProfileRef);
        }
    }
}

export async function getUserById(uid: string): Promise<RegisteredUser | null> {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return { uid, ...snapshot.val() };
    }
    return null;
}

export async function getUserByEmail(email: string): Promise<RegisteredUser | null> {
    const usersRef = query(ref(db, 'users'), orderByChild('email'), equalTo(email));
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        const uid = Object.keys(usersData)[0];
        return { uid, ...usersData[uid] };
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
        enrollmentDate: new Date().toISOString(),
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

export async function getPublicProfiles(): Promise<RegisteredUser[]> {
    const publicProfilesRef = query(ref(db, 'users'), orderByChild('portfolio/public'), equalTo(true));
    const snapshot = await get(publicProfilesRef);
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
  const defaults = {
    title: 'Unlock Your Potential.', 
    subtitle: 'Quality, affordable courses designed for the Kenyan market.',
    imageUrl: 'https://placehold.co/1200x400.png',
    programsImageUrl: 'https://picsum.photos/seed/prog/1600/400',
    bootcampsImageUrl: 'https://picsum.photos/seed/boot/1600/400',
    hackathonsImageUrl: 'https://picsum.photos/seed/hack/1600/400',
    loginImageUrl: 'https://placehold.co/1200x900.png',
    signupImageUrl: 'https://placehold.co/1200x900.png',
    slideshowSpeed: 5,
    imageBrightness: 60,
    recaptchaEnabled: true,
    theme: 'default',
    animationsEnabled: true,
    orgHeroTitle: 'Manda Network for Business',
    orgHeroSubtitle: 'Empower your workforce with the skills they need to succeed.',
    orgHeroImageUrl: 'https://picsum.photos/1200/800',
    orgLoginImageUrl: 'https://picsum.photos/1200/900',
    orgSignupImageUrl: 'https://picsum.photos/1200/900',
  };

  const dbData = snapshot.exists() ? snapshot.val() : {};
  
  // Remote Config is now client-only, so we don't fetch it here on the server.
  // We can combine the DB data with client-fetched remote config in the component itself.
  
  return { ...defaults, ...dbData };
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

export async function getUserSubmissionsForCourse(userId: string, courseId: string): Promise<Submission[]> {
    const submissionsRef = query(ref(db, 'submissions'), orderByChild('userId'), equalTo(userId));
    const snapshot = await get(submissionsRef);
    if (snapshot.exists()) {
        const submissionsData = snapshot.val();
        return Object.keys(submissionsData)
            .map(key => ({
                id: key,
                ...submissionsData[key],
            }))
            .filter(submission => submission.courseId === courseId);
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
        avatarUrl: '/gina-avatar.png',
    };
    if (snapshot.exists()) {
        return { ...defaults, ...snapshot.val() };
    }
    return defaults;
}

// Remote Config Functions
export async function getRemoteConfigValues(keys: string[]): Promise<Record<string, string>> {
    const remoteConfig = getRemoteConfig(app);
    if (typeof window !== 'undefined') {
        await fetchAndActivate(remoteConfig);
    }
    
    const configValues: Record<string, string> = {};
    keys.forEach(key => {
        configValues[key] = getString(remoteConfig, key);
    });
    return configValues;
}


export async function saveRemoteConfigValues(data: Record<string, string>): Promise<void> {
    // This function can't actually save to remote config from the client.
    // It will write to the Realtime Database instead as a mock.
    const heroRef = ref(db, 'hero');
    await update(heroRef, {
        title: data.hero_title,
        subtitle: data.hero_subtitle
    });
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
        const notifications = Object.keys(notificationsData).map(key => ({
            id: key,
            ...notificationsData[key]
        }));
        return notifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
}

// User Notes Functions
export async function saveUserNotes(userId: string, courseId: string, notes: string): Promise<void> {
    const notesRef = ref(db, `userNotes/${userId}/${courseId}`);
    await set(notesRef, { notes });
}

export async function getUserNotes(userId: string, courseId: string): Promise<string> {
    const notesRef = ref(db, `userNotes/${userId}/${courseId}/notes`);
    const snapshot = await get(notesRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return '';
}

// Discussion Forum Functions
export async function createThread(courseId: string, threadData: Omit<DiscussionThread, 'id'>): Promise<string> {
    const threadsRef = ref(db, `discussions/threads/${courseId}`);
    const newThreadRef = push(threadsRef);
    await set(newThreadRef, threadData);
    return newThreadRef.key!;
}

export async function getThreadsForCourse(courseId: string): Promise<DiscussionThread[]> {
    const threadsRef = query(ref(db, `discussions/threads/${courseId}`), orderByChild('createdAt'));
    const snapshot = await get(threadsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const threads = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        return threads.reverse();
    }
    return [];
}

export async function createReply(threadId: string, replyData: Omit<DiscussionReply, 'id'>): Promise<string> {
    const repliesRef = ref(db, `discussions/replies/${threadId}`);
    const newReplyRef = push(repliesRef);
    await set(newReplyRef, replyData);
    return newReplyRef.key!;
}

export async function getRepliesForThread(threadId: string): Promise<DiscussionReply[]> {
    const repliesRef = query(ref(db, `discussions/replies/${threadId}`), orderByChild('createdAt'));
    const snapshot = await get(repliesRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}


// Live Session Functions
export async function getLiveSession(): Promise<LiveSession | null> {
    const sessionRef = ref(db, 'liveSession');
    const snapshot = await get(sessionRef);
    if(snapshot.exists()) {
        return snapshot.val() as LiveSession;
    }
    return null;
}

export async function updateLiveSession(data: Partial<LiveSession>): Promise<void> {
    const sessionRef = ref(db, 'liveSession');
    await update(sessionRef, data);
}

// Program Functions
export async function createProgram(programData: Omit<Program, 'id'>): Promise<string> {
    const programsRef = ref(db, 'programs');
    const newProgramRef = push(programsRef);
    await set(newProgramRef, programData);
    return newProgramRef.key!;
}

export async function getAllPrograms(): Promise<Program[]> {
    const programsRef = ref(db, 'programs');
    const snapshot = await get(programsRef);
    if (snapshot.exists()) {
        const programsData = snapshot.val();
        return Object.keys(programsData).map(key => ({
            id: key,
            ...programsData[key]
        }));
    }
    return [];
}

export async function getProgramById(id: string): Promise<Program | null> {
    const programRef = ref(db, `programs/${id}`);
    const snapshot = await get(programRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function updateProgram(id: string, programData: Partial<Program>): Promise<void> {
    const programRef = ref(db, `programs/${id}`);
    await update(programRef, programData);
}

export async function deleteProgram(id: string): Promise<void> {
    const programRef = ref(db, `programs/${id}`);
    await remove(programRef);
}

// Bundle Functions
export async function createBundle(bundleData: Omit<Bundle, 'id'>): Promise<string> {
    const bundlesRef = ref(db, 'bundles');
    const newBundleRef = push(bundlesRef);
    await set(newBundleRef, bundleData);
    return newBundleRef.key!;
}

export async function getAllBundles(): Promise<Bundle[]> {
    const bundlesRef = ref(db, 'bundles');
    const snapshot = await get(bundlesRef);
    if (snapshot.exists()) {
        const bundlesData = snapshot.val();
        return Object.keys(bundlesData).map(key => ({
            id: key,
            ...bundlesData[key]
        }));
    }
    return [];
}

export async function getBundleById(id: string): Promise<Bundle | null> {
    const bundleRef = ref(db, `bundles/${id}`);
    const snapshot = await get(bundleRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function updateBundle(id: string, bundleData: Partial<Bundle>): Promise<void> {
    const bundleRef = ref(db, `bundles/${id}`);
    await update(bundleRef, bundleData);
}

export async function deleteBundle(id: string): Promise<void> {
    const bundleRef = ref(db, `bundles/${id}`);
    await remove(bundleRef);
}

// API Key and Usage Functions
export async function createApiKey(userId: string, keyData: Omit<ApiKey, 'id'>): Promise<string> {
    const keysRef = ref(db, `apiKeys/${userId}`);
    const newKeyRef = push(keysRef);
    await set(newKeyRef, keyData);
    return newKeyRef.key!;
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const keysRef = ref(db, `apiKeys/${userId}`);
    const snapshot = await get(keysRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}

export async function deleteApiKey(userId: string, keyId: string): Promise<void> {
    const keyRef = ref(db, `apiKeys/${userId}/${keyId}`);
    await remove(keyRef);
}

export async function logApiCall(userId: string, endpoint: string): Promise<void> {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
        apiCallCount: increment(1)
    });

    const usageLogRef = ref(db, `apiUsage/${userId}`);
    const newLogRef = push(usageLogRef);
    await set(newLogRef, {
        endpoint,
        timestamp: new Date().toISOString(),
    });
}

// Student social features
export async function createCourseFeedback(courseId: string, feedbackData: Omit<CourseFeedback, 'id' | 'courseId' | 'createdAt'>): Promise<string> {
    const feedbackRef = ref(db, `courseFeedback/${courseId}`);
    const newFeedbackRef = push(feedbackRef);
    await set(newFeedbackRef, {
        ...feedbackData,
        createdAt: new Date().toISOString(),
    });
    return newFeedbackRef.key!;
}

export async function getProjectsForCourse(courseId: string): Promise<ProjectSubmission[]> {
    const projectsRef = ref(db, `projectSubmissions/${courseId}`);
    const snapshot = await get(projectsRef);
     if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}

export async function submitProject(courseId: string, userId: string, projectData: Omit<ProjectSubmission, 'id'>): Promise<string> {
    const projectRef = ref(db, `projectSubmissions/${courseId}/${userId}`);
    await set(projectRef, projectData);
    return userId;
}

export async function saveLearningGoals(userId: string, goals: Record<string, LearningGoal>): Promise<void> {
    const goalsRef = ref(db, `users/${userId}/learningGoals`);
    await set(goalsRef, goals);
}


// Super Admin Permission Requests
export async function createPermissionRequest(requestData: Omit<PermissionRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const requestsRef = ref(db, 'permissionRequests');
    const newRequestRef = push(requestsRef);
    const dataToSave: Omit<PermissionRequest, 'id'> = {
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    await set(newRequestRef, dataToSave);
    return newRequestRef.key!;
}

export async function getPermissionRequests(): Promise<PermissionRequest[]> {
    const requestsRef = ref(db, 'permissionRequests');
    const snapshot = await get(requestsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const requests = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        return requests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
}

export async function updatePermissionRequestStatus(id: string, status: 'approved' | 'denied'): Promise<void> {
    const requestRef = ref(db, `permissionRequests/${id}`);
    await update(requestRef, {
        status,
        resolvedAt: new Date().toISOString(),
    });
}

// Organization Functions
export async function createOrganization(orgData: Omit<Organization, 'id'>): Promise<string> {
    const orgsRef = ref(db, 'organizations');
    const newOrgRef = push(orgsRef);
    await set(newOrgRef, orgData);
    return newOrgRef.key!;
}

export async function getOrganizationMembers(orgId: string): Promise<RegisteredUser[]> {
    const usersRef = query(ref(db, 'users'), orderByChild('organizationId'), equalTo(orgId));
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

export async function getAllOrganizations(): Promise<Organization[]> {
    const orgsRef = ref(db, 'organizations');
    const snapshot = await get(orgsRef);
    if (snapshot.exists()) {
        const orgsData = snapshot.val();
        return Object.keys(orgsData).map(key => ({
            id: key,
            ...orgsData[key]
        }));
    }
    return [];
}

export async function getOrganizationByOwnerId(ownerId: string): Promise<Organization | null> {
  const orgsRef = query(ref(db, 'organizations'), orderByChild('ownerId'), equalTo(ownerId));
  const snapshot = await get(orgsRef);
  if (snapshot.exists()) {
    const orgsData = snapshot.val();
    const orgId = Object.keys(orgsData)[0];
    return { id: orgId, ...orgsData[orgId] };
  }
  return null;
}

export async function updateOrganization(orgId: string, orgData: Partial<Organization>): Promise<void> {
    const orgRef = ref(db, `organizations/${orgId}`);
    await update(orgRef, orgData);
}

export async function deleteOrganization(orgId: string): Promise<void> {
    const orgRef = ref(db, `organizations/${orgId}`);
    // You might also want to handle members associated with this org
    await remove(orgRef);
}


// Invitation Functions
export async function createInvitation(inviteData: Omit<Invitation, 'id'>): Promise<string> {
    const invitesRef = ref(db, 'invitations');
    const newInviteRef = push(invitesRef);
    
    await createNotification({
        userId: inviteData.userId!,
        title: 'Organization Invitation',
        body: `You have been invited to join ${inviteData.organizationName}.`,
        actions: [{
            title: 'Accept',
            action: 'accept_org_invite',
            payload: {
                inviteId: newInviteRef.key!,
                organizationId: inviteData.organizationId,
            }
        }]
    });

    await set(newInviteRef, inviteData);
    return newInviteRef.key!;
}

export async function getInvitation(inviteId: string): Promise<Invitation | null> {
    const inviteRef = ref(db, `invitations/${inviteId}`);
    const snapshot = await get(inviteRef);
    if (snapshot.exists()) {
        return { id: inviteId, ...snapshot.val() };
    }
    return null;
}

export async function updateInvitationStatus(inviteId: string, status: 'accepted'): Promise<void> {
    const inviteRef = ref(db, `invitations/${inviteId}`);
    await update(inviteRef, { status });
}

export async function deleteInvitation(inviteId: string): Promise<void> {
    const inviteRef = ref(db, `invitations/${inviteId}`);
    await remove(inviteRef);
}

// Bootcamp Functions
export async function createBootcamp(bootcampData: Omit<Bootcamp, 'id'>): Promise<string> {
    const bootcampsRef = ref(db, 'bootcamps');
    const newBootcampRef = push(bootcampsRef);
    await set(newBootcampRef, bootcampData);
    return newBootcampRef.key!;
}

export async function getAllBootcamps(): Promise<Bootcamp[]> {
    const bootcampsRef = ref(db, 'bootcamps');
    const snapshot = await get(bootcampsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    }
    return [];
}

export async function getBootcampById(id: string): Promise<Bootcamp | null> {
    const bootcampRef = ref(db, `bootcamps/${id}`);
    const snapshot = await get(bootcampRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function updateBootcamp(id: string, bootcampData: Partial<Bootcamp>): Promise<void> {
    const bootcampRef = ref(db, `bootcamps/${id}`);
    await update(bootcampRef, bootcampData);
}

export async function deleteBootcamp(id: string): Promise<void> {
    const bootcampRef = ref(db, `bootcamps/${id}`);
    await remove(bootcampRef);
}

// Pricing Plan Functions
export async function createPlan(planData: Omit<PricingPlan, 'id'>): Promise<string> {
    const plansRef = ref(db, 'pricingPlans');
    const newPlanRef = push(plansRef);
    await set(newPlanRef, planData);
    return newPlanRef.key!;
}

export async function getAllPlans(): Promise<PricingPlan[]> {
    const plansRef = ref(db, 'pricingPlans');
    const snapshot = await get(plansRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    }
    return [];
}

export async function getPlanById(id: string): Promise<PricingPlan | null> {
    const planRef = ref(db, `pricingPlans/${id}`);
    const snapshot = await get(planRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function updatePlan(id: string, planData: Partial<PricingPlan>): Promise<void> {
    const planRef = ref(db, `pricingPlans/${id}`);
    await update(planRef, planData);
}

export async function deletePlan(id: string): Promise<void> {
    const planRef = ref(db, `pricingPlans/${id}`);
    await remove(planRef);
}

// Document Management Functions
export async function saveDocument(docType: string, content: string): Promise<void> {
    const docRef = ref(db, `documents/${docType}`);
    await set(docRef, { content });
}

export async function getDocument(docType: string): Promise<string> {
    const docRef = ref(db, `documents/${docType}/content`);
    const snapshot = await get(docRef);
    return snapshot.exists() ? snapshot.val() : '';
}

// Hackathon Functions
export async function createHackathon(hackathonData: Omit<Hackathon, 'id'>): Promise<string> {
    const hackathonsRef = ref(db, 'hackathons');
    const newHackathonRef = push(hackathonsRef);
    await set(newHackathonRef, hackathonData);
    return newHackathonRef.key!;
}

export async function updateHackathon(id: string, hackathonData: Partial<Hackathon>): Promise<void> {
    const hackathonRef = ref(db, `hackathons/${id}`);
    await update(hackathonRef, hackathonData);
}

export async function deleteHackathon(id: string): Promise<void> {
    const hackathonRef = ref(db, `hackathons/${id}`);
    await remove(hackathonRef);
}

export async function getAllHackathons(): Promise<Hackathon[]> {
    const hackathonsRef = ref(db, 'hackathons');
    const snapshot = await get(hackathonsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}

export async function getHackathonById(id: string): Promise<Hackathon | null> {
    const hackathonRef = ref(db, `hackathons/${id}`);
    const snapshot = await get(hackathonRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export async function getHackathonParticipants(hackathonId: string): Promise<RegisteredUser[]> {
    const participantsRef = ref(db, `hackathonParticipants/${hackathonId}`);
    const snapshot = await get(participantsRef);
    if (snapshot.exists()) {
        const participantIds = Object.keys(snapshot.val());
        const participantPromises = participantIds.map(uid => getUserById(uid));
        const participants = await Promise.all(participantPromises);
        return participants.filter(p => p !== null) as RegisteredUser[];
    }
    return [];
}

export async function registerForHackathon(hackathonId: string, userId: string): Promise<void> {
    const registrationRef = ref(db, `hackathonParticipants/${hackathonId}/${userId}`);
    await set(registrationRef, true);
}

export async function createHackathonSubmission(submissionData: Omit<HackathonSubmission, 'id'>): Promise<string> {
    const submissionsRef = ref(db, `hackathonSubmissions`);
    const newSubmissionRef = push(submissionsRef);
    await set(newSubmissionRef, submissionData);
    return newSubmissionRef.key!;
}

export async function getHackathonSubmissions(hackathonId: string): Promise<HackathonSubmission[]> {
    const submissionsRef = query(ref(db, 'hackathonSubmissions'), orderByChild('hackathonId'), equalTo(hackathonId));
    const snapshot = await get(submissionsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
}

export async function getHackathonSubmissionsByUser(userId: string): Promise<HackathonSubmission[]> {
    const submissionsRef = query(ref(db, 'hackathonSubmissions'), orderByChild('userId'), equalTo(userId));
    const snapshot = await get(submissionsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const submissions = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        return submissions.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    return [];
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const submissionsRef = ref(db, 'hackathonSubmissions');
    const snapshot = await get(submissionsRef);
    if (!snapshot.exists()) {
        return [];
    }
    
    const submissions: HackathonSubmission[] = Object.values(snapshot.val());
    const userStats: Record<string, { score: number; hackathonCount: Set<string>; userName: string; userAvatar: string }> = {};

    for (const sub of submissions) {
        if (!userStats[sub.userId]) {
            userStats[sub.userId] = { score: 0, hackathonCount: new Set(), userName: sub.userName, userAvatar: '' };
            const userProfile = await getUserById(sub.userId);
            if(userProfile) {
                userStats[sub.userId].userName = userProfile.displayName || sub.userName;
                userStats[sub.userId].userAvatar = userProfile.photoURL || '';
            }
        }
        userStats[sub.userId].score += 10; // Simple scoring: 10 points per submission
        userStats[sub.userId].hackathonCount.add(sub.hackathonId);
    }
    
    const leaderboard = Object.entries(userStats).map(([userId, stats]) => ({
        userId,
        userName: stats.userName,
        userAvatar: stats.userAvatar,
        score: stats.score,
        hackathonCount: stats.hackathonCount.size
    }));

    return leaderboard.sort((a,b) => b.score - a.score);
}
