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
    const inviteRef = db.ref('invitations').orderByChild('email').equalTo(email!).limitToFirst(1);
    const inviteSnapshot = await inviteRef.once('value');
    
    let organizationId: string | undefined = undefined;
    let isOrganizationAdmin = false;

    if (inviteSnapshot.exists()) {
        const inviteData = inviteSnapshot.val();
        const inviteId = Object.keys(inviteData)[0];
        organizationId = inviteData[inviteId].organizationId;
        
        // Remove the invitation after it's been used.
        await db.ref(`invitations/${inviteId}`).remove();
    } else {
         // Check if this is the first user signing up for a new organization.
         // This is a simple check; a real app might have a more explicit org creation flow.
         const orgNameFromEmail = email?.split('@')[1];
         if (orgNameFromEmail) {
            const orgsRef = db.ref('organizations').orderByChild('name').equalTo(orgNameFromEmail);
            const orgSnapshot = await orgsRef.once('value');
            if (!orgSnapshot.exists()) {
                const trialExpiry = add(new Date(), { days: 30 }).toISOString();
                const newOrgRef = db.ref('organizations').push();
                await newOrgRef.set({
                    name: orgNameFromEmail,
                    ownerId: uid,
                    createdAt: new Date().toISOString(),
                    subscriptionTier: 'trial',
                    subscriptionExpiresAt: trialExpiry,
                    memberLimit: 5,
                });
                organizationId = newOrgRef.key!;
                isOrganizationAdmin = true;
            }
         }
    }

    try {
        await userRef.set({
            email: email,
            displayName: displayName || 'New User',
            createdAt: creationTime,
            organizationId: organizationId || null,
            isOrganizationAdmin: isOrganizationAdmin,
        });
        console.log(`Successfully created user record for ${uid}`);
    } catch (error) {
        console.error(`Failed to create user record for ${uid}:`, error);
    }
});
