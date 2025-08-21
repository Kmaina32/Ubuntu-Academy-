# SkillSet Academy - AI-Powered Learning Platform

Welcome to SkillSet Academy, a modern, AI-enhanced online learning platform built with Next.js and Firebase. This application is designed to provide a seamless and feature-rich experience for both students and administrators in the Kenyan market.

## Key Features

The platform is divided into two main user experiences: the student-facing application and the comprehensive admin dashboard.

### Student Experience
- **Course Discovery & Enrollment:** Browse a public catalog of featured courses and enroll with a single click for free courses or via a simulated M-Pesa payment flow for paid content.
- **Secure Authentication:** User sign-up and login with email/password or Google, including email verification and password reset functionality.
- **Personalized Dashboard:** A central hub for students to view their enrolled courses, track progress, and access earned certificates.
- **AI-Powered Help Center:** An AI assistant to help students with their questions about the platform.
- **Interactive Learning Interface:** A rich course player with video support, lesson content, and progress tracking. Students mark lessons as complete to advance.
- **AI Tutor ("Gina"):** Inside the course player, students can chat with an AI tutor. They can ask questions about the lesson, request summaries, or take a quiz. The tutor also supports voice-to-text input and text-to-speech output for an interactive experience.
- **Integrated Notebook:** Students have access to a personal notebook for each course, directly within the learning interface. Notes are saved automatically and can be downloaded as a branded PDF.
- **Live Classroom & Calendar:** View a live video stream from the instructor and keep track of important dates with a personal calendar that can be synced with Google Calendar.
- **Discussion Forums:** Engage in discussions with instructors and peers on course-specific topics.
- **Comprehensive Final Exams:** Take multi-part final exams with a mix of multiple-choice and short-answer questions. Pasting is disabled to encourage original work.
- **Automated Certification:** Automatically receive a downloadable and printable certificate upon successfully passing a course final exam.
- **Profile Management:** Students can update their personal details and profile picture, which are reflected on their certificates.

### Admin Experience
- **Secure Admin Dashboard:** A protected section of the site accessible only to a designated administrator, with a dedicated sidebar for easy navigation.
- **Full Course Management (CRUD):** Create, read, update, and delete courses in the catalog.
- **AI-Powered Content Generation:** Create entire courses—including modules, lessons, and a final exam—from a single title prompt and optional context. The generated content can be reviewed and edited before saving.
- **AI-Powered Exam Generation:** Generate a comprehensive exam for any existing course with a single click.
- **Flexible Exam Management:** Manually create and manage exams with both multiple-choice and short-answer questions.
- **AI-Assisted Grading:** Review student exam submissions. Multiple-choice questions are auto-graded, and an AI assistant provides suggested scores and feedback for short-answer questions.
- **User & Cohort Management:** View a list of all registered users, manage their cohort assignments, and remove users.
- **Live Session Control:** Start and stop a live video broadcast for all students from the admin panel.
- **Push Notifications:** Send platform-wide announcements to all users.
- **Payment Transaction Overview:** A dedicated page to view (simulated) M-Pesa transaction history.
- **Site & Theme Management:** Control the website's hero content, imagery, and active visual theme (e.g., Christmas, Valentine's Day) directly from the admin panel. Animations for themes can be toggled on or off globally.
- **AI Tutor Configuration:** Customize the AI tutor's voice, speech speed, and welcome prompts.
- **Admin Help Center:** An AI assistant specifically trained on the platform's features to help the administrator.
- **Event Scheduling:** An admin-only calendar to create and manage events for students.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Database:** [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth)
- **Remote Configuration:** [Firebase Remote Config](https://firebase.google.com/products/remote-config) for dynamic content updates.
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (via Google AI)
- **UI:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) for certificates and notes.

## Getting Started

To get the application running locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    This command starts the Next.js application.
    ```bash
    npm run dev
    ```

3.  **Run the Genkit Development Server:**
    This command starts the Genkit AI flows, which are required for features like content generation and AI-assisted grading. This should be run in a separate terminal.
    ```bash
    npm run genkit:dev
    ```

4.  **Open the Application:**
    Navigate to `http://localhost:9002` in your browser to see the application in action.

**Admin Access:** To access the admin dashboard, log in with the designated admin account.
