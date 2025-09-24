
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { add } from 'date-fns';

admin.initializeApp();

const db = admin.database();

// This function triggers whenever a new user is created in Firebase Authentication.
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, metadata } = user;
    const creationTime = metadata.creationTime;

    const userRef = db.ref(`/users/${uid}`);

    // This function now only creates the basic user record.
    // Complex logic like organization creation or invitation handling is
    // managed on the client-side during the signup process for better reliability.
    try {
        await userRef.set({
            email: email,
            displayName: displayName || 'New User',
            createdAt: creationTime,
        });
        console.log(`Successfully created user record for ${uid}`);
    } catch (error) {
        console.error(`Failed to create user record for ${uid}:`, error);
    }
});
