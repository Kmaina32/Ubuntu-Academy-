# Ubuntu Academy - Application Framework Document

This document provides a technical overview of the Ubuntu Academy application, including its architecture, data models, AI integrations, and key operational flows.

## 1. Core Architecture

The application is built on a modern, server-centric web stack designed for performance, scalability, and a rich user experience.

### 1.1. Frontend & Backend Framework

-   **Next.js (App Router):** The application uses the Next.js App Router, which enables a hybrid approach of Server Components and Client Components.
    -   **Server Components (`'use server'`)** are used by default for pages and data fetching, reducing the amount of JavaScript sent to the client and improving initial load times.
    -   **Client Components (`'use client'`)** are used for interactive UI elements that require state, effects, or browser-only APIs (e.g., forms, interactive charts, course player).
-   **React & TypeScript:** The UI is built with React and fully typed with TypeScript, ensuring code quality and maintainability.

### 1.2. Database and Backend Services

-   **Firebase:** The application leverages the Firebase platform for its backend needs:
    -   **Firebase Realtime Database:** A NoSQL database used for storing all application data, including courses, user profiles, submissions, and more. Data structures are optimized for real-time synchronization.
    -   **Firebase Authentication:** Manages user identity, supporting email/password and Google OAuth sign-in. It handles user sessions, email verification, and password resets.
    -   **Firebase Storage:** Used for hosting user-uploaded content, specifically profile pictures.
    -   **Firebase Remote Config:** Used for managing site-wide settings that can be updated instantly without a new deployment (e.g., homepage hero text, feature flags).

### 1.3. Generative AI

-   **Genkit:** All generative AI features are powered by Genkit, a Google framework for building production-ready AI flows.
    -   **AI Flows (`src/ai/flows`):** Each distinct AI capability (e.g., course generation, exam grading, AI tutor) is encapsulated in its own Genkit flow. These flows are server-side functions that orchestrate calls to AI models and other tools.
    -   **AI Tools (`src/ai/tools`):** Reusable functions that can be called by AI models to retrieve data or perform actions (e.g., `listCoursesTool` for fetching the course catalog).
    -   **AI Models:** The primary models used are from the Google AI (Gemini) family, including `gemini-1.5-flash` for text generation, speech-to-text, and `gemini-2.5-flash-preview-tts` for text-to-speech.

### 1.4. UI and Styling

-   **ShadCN UI:** A component library that provides unstyled, accessible, and composable building blocks for the UI.
-   **Tailwind CSS:** A utility-first CSS framework used for all styling.
-   **Theming:** A dynamic theming system is implemented in `globals.css` and controlled via Firebase, allowing for sitewide visual changes (e.g., for holidays) without a code change.

## 2. Data Models

The core data structures are defined in `src/lib/mock-data.ts` and stored in Firebase Realtime Database.

-   **`Course`**: Represents a single course, containing metadata, modules, lessons, and the final exam structure.
-   **`Program` & `Bundle`**: Represent collections of courses, packaged for different purposes (certification vs. sale).
-   **`User`**: Stored under `/users/{uid}`, it contains public profile information and cohort assignments.
-   **`UserCourse`**: A nested object under `/users/{uid}/purchasedCourses/{courseId}` that tracks a specific user's progress, completion status, and certificate availability for a course.
-   **`Submission`**: Represents a student's final exam submission, including their answers, grade, and feedback.
-   **`TutorHistory`**: Stores the chat history between a student and the AI tutor for a specific lesson, enabling conversation memory.
-   **`DiscussionThread` & `DiscussionReply`**: Power the course-specific discussion forums.

## 3. Key Operational Flows

### 3.1. Admin Course Generation

1.  **Admin UI (`/admin/courses/create`):** The admin enters a course title and optional context.
2.  **Genkit Flow (`generateCourseContent`):** The UI calls this flow.
3.  **AI Model (Gemini):** The flow sends a detailed prompt with the title and context to the Gemini model, requesting a full course structure (description, modules, lessons, exam) in a specific JSON format.
4.  **Review Modal:** The generated content is passed back to the client and displayed in a rich editing modal (`CourseReviewModal`).
5.  **Save to Firebase:** After admin review and approval, the final course object is saved to the Realtime Database.

### 3.2. Student Enrollment

1.  **User Action:** Student clicks "Enroll" or "Purchase".
2.  **Authentication Check:** The system verifies the user is logged in.
3.  **Payment:**
    -   **Free Course:** The `enrollUserInCourse` function is called directly.
    -   **Paid Course:** The `MpesaModal` is shown. A simulated payment process occurs.
4.  **Database Update:** Upon successful "payment" or free enrollment, a `UserCourse` object is created at `/users/{uid}/purchasedCourses/{courseId}`, granting the student access.

### 3.3. Student Learning & Drip Content

1.  **Course Player (`/courses/[id]/learn`):** When a student enters the player, the system fetches their `UserCourse` data, including their `enrollmentDate`.
2.  **Drip Logic:** The UI calculates the number of unlocked lessons based on the course's `dripFeed` setting (`daily`, `weekly`, or `off`) and the time elapsed since the `enrollmentDate`.
3.  **Lesson Completion:** When a student marks a lesson as complete, their `completedLessons` array and `progress` percentage are updated in the database. The player then automatically advances to the next unlocked lesson.

### 3.4. Exam Grading and Certification

1.  **Student Submission:** The student completes the exam, and a `Submission` object is created in the database.
2.  **Admin Grading UI (`/admin/assignments/grade/[submissionId]`):** The admin views the submission. Multiple-choice questions are auto-graded by the UI.
3.  **AI-Assisted Grading:** For short-answer questions, the admin clicks "Grade with AI".
4.  **Genkit Flow (`gradeShortAnswerExam`):** This flow sends the student's answer and the reference answer to the Gemini model, which returns a suggested score and feedback.
5.  **Grade Approval:** The admin reviews the AI's suggestion and saves the final grade.
6.  **Certificate Issuance:** If the final score meets the passing threshold (80%), the student's `certificateAvailable` flag is set to `true` for that course, unlocking the certificate on their dashboard.
