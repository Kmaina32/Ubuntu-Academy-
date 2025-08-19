
# Mkenya Skilled - AI-Powered Learning Platform

Welcome to Mkenya Skilled, a modern, AI-enhanced online learning platform built with Next.js and Firebase. This application is designed to provide a seamless and feature-rich experience for both students and administrators in the Kenyan market.

## Key Features

The platform is divided into two main user experiences: the student-facing application and the comprehensive admin dashboard.

### Student Experience
- **Course Discovery:** Browse a public catalog of featured courses.
- **Authentication:** Secure user sign-up and login.
- **Dashboard:** A personalized space for students to view their enrolled courses, track progress, and access certificates.
- **Course Enrollment:** Supports both free and paid courses, with a simulated M-Pesa payment flow for paid content.
- **AI-Powered Help Center:** An AI assistant (powered by Genkit) to help students with their questions about the platform.
- **Learning Interface:** A rich course player with drip-fed content (lessons unlock daily on weekdays), video support, and progress tracking.
- **Assessments:** Take multi-part final exams with a mix of multiple-choice and short-answer questions.
- **Certificate Generation:** Automatically receive a downloadable and printable certificate upon successful course completion.
- **Profile Management:** Students can update their personal details, which are reflected on their certificates.

### Admin Experience
- **Secure Admin Area:** A protected section of the site accessible only to a designated administrator.
- **Course Management:** Full CRUD (Create, Read, Update, Delete) functionality for courses.
- **AI-Powered Content Generation:** Create entire courses—including modules, lessons, and a final exam—from a single title prompt. The generated content can be reviewed and edited before saving.
- **AI-Powered Exam Generation:** Generate a comprehensive exam for any existing course with a single click.
- **Flexible Exam Management:** Create and manage exams with both multiple-choice and short-answer questions.
- **AI-Assisted Grading:** Review student exam submissions. Multiple-choice questions are auto-graded, and an AI assistant provides suggested scores and feedback for short-answer questions.
- **User Management:** View a list of all registered users.
- **Calendar/Scheduling:** An admin-only calendar to create and manage events for students.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Database:** [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth)
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (via Google AI)
- **UI:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation

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
