# Manda Network - Database Security Rules Overview

This document provides a clear, high-level explanation of the security rules that govern the Manda Network Firebase Realtime Database. These rules are critical for protecting user data, ensuring data integrity, and controlling access to different parts of the application.

## 1. Core Principles

Our security model is built on a "deny by default" principle. This means that no data can be read or written unless a specific rule explicitly allows it.

- **`.read: false` & `.write: false` at the root:** By default, no one can access any data. Access must be granted at deeper levels in the database tree.
- **Authentication is Key:** For almost all operations, a user must be authenticated (`auth != null`). Publicly readable data is the only exception.
- **Role-Based Access Control (RBAC):** We use a custom `isAdmin` flag on user profiles to differentiate between standard users and administrators, granting admins broader permissions.

## 2. Rule Breakdown by Data Path

### Publicly Readable Data

This data is visible to everyone, including logged-out visitors, to allow for browsing and discovery.

-   `/courses`: The list of all available courses.
-   `/programs`: The list of certificate programs.
-   `/bundles`: The list of course bundles.
-   `/bootcamps`: The list of bootcamps.
-   `/hackathons`: The list of hackathons.
-   `/hero`, `/tutorSettings`, `/certificateSettings`: General site configuration data.

**Rule:**
```json
".read": true
```

---

### User-Specific Data (`/users/$userId`)

This is the most critical path, containing user profiles and their associated data.

-   **Read Access:**
    -   You can always read your own user data.
    -   An administrator can read any user's data.
    -   Anyone can read a user's data *if* their portfolio is set to public (`portfolio/public === true`).
-   **Write Access:**
    -   You can only write to your own user data (`$uid === auth.uid`).
    -   An administrator can write to any user's data.
-   **Specific Sub-paths:**
    -   `/users/$userId/purchasedCourses`: Only the user themselves or an admin can read this, and only an admin can write to it (e.g., to enroll a user after payment).
    -   `/users/$userId/isAdmin`: Only an admin can change the value of this flag, preventing users from elevating their own privileges.

---

### Submissions (`/submissions` & `/hackathonSubmissions`)

This path stores student answers for exams and projects.

-   **Read Access:**
    -   A user can only read their own submissions.
    -   An admin can read all submissions for grading purposes.
-   **Write Access:**
    -   A user can only write a new submission if the `userId` in the submission data matches their own ID.
    -   An admin can write to any submission path (e.g., to add grades).

---

### Organization Data (`/organizations`)

Manages B2B client data.

-   **Read Access:** Any authenticated user can read the list of organizations.
-   **Write Access:**
    -   A new organization can be created by any authenticated user (during the org signup process).
    -   An existing organization can only be modified by its designated `ownerId` or a platform super admin.
-   **Invitations (`/invitations`):** Only organization admins or platform admins can create or manage invitations.

---

### Interactive Features

-   **Discussions (`/discussions`):** Any authenticated user can read and write to discussion threads and replies, fostering a community environment.
-   **User Notes (`/userNotes`):** Strictly private. A user can only read and write to their own notes path (`/userNotes/$userId`).
-   **Tutor History (`/tutorHistory`):** Strictly private. A user can only read and write to their own chat history with the AI tutor.
-   **Leaderboard (`/leaderboard`):**
    -   `.read`: Publicly readable.
    -   `.write`: A user can only write to their own leaderboard entry (`$userId === auth.uid`), which happens automatically upon hackathon submission. Admins can write to any entry.

---

This layered approach ensures that while the platform is open and discoverable, sensitive user data remains protected and modifiable only by the appropriate individuals.
