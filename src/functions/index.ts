
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

    // Check if the user was created via an invitation.
    // In a real app, the inviteId would be passed from the client during signup,
    // but for this trigger, we'll check by email.
    const inviteRef = db.ref('invitations').orderByChild('email').equalTo(email!).limitToFirst(1);
    const inviteSnapshot = await inviteRef.once('value');
    
    let organizationId: string | undefined = undefined;
    let isOrganizationAdmin = false;

    if (inviteSnapshot.exists()) {
        const inviteData = inviteSnapshot.val();
        const inviteId = Object.keys(inviteData)[0];
        organizationId = inviteData[inviteId].organizationId;
        
        // It's good practice to remove the invitation after it's been used.
        await db.ref(`invitations/${inviteId}`).remove();
    } 

    try {
        await userRef.set({
            email: email,
            displayName: displayName || 'New User',
            createdAt: creationTime,
            organizationId: organizationId || null,
            // Only the owner of a new org should be an admin initially
            isOrganizationAdmin: isOrganizationAdmin,
        });
        console.log(`Successfully created user record for ${uid}`);
    } catch (error) {
        console.error(`Failed to create user record for ${uid}:`, error);
    }
});
