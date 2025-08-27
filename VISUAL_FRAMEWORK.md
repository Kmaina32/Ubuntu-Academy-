# Ubuntu Academy - Visual Framework

This document provides a graphical overview of the application's structure and key operational flows using Mermaid syntax. These diagrams can be rendered by GitHub or compatible Markdown editors.

## 1. Application Site Map

This diagram shows the main pages of the application and how they are interconnected. It distinguishes between public pages, student-authenticated pages, and the admin section.

```mermaid
graph TD
    subgraph Public Area
        A[Home Page /] --> B[Courses];
        A --> C[About Us];
        A --> D[Contact];
        A --> E[Help];
        A --> F[Login];
        A --> G[Sign Up];
    end

    subgraph Student Area
        H[Dashboard] --> I[Course Player /learn];
        H --> J[My Exams /assignments];
        H --> K[My Notebooks /notebook];
        H --> L[Calendar];
        H --> M[Profile];
        I --> N[Take Final Exam /exam];
        B --> O[Course Detail Page];
        O --> I;
    end
    
    subgraph Admin Area
        P[Admin Dashboard /admin] --> Q[Create Course];
        P --> R[Edit Course];
        P --> S[Manage Assignments];
        P --> T[Grade Submission];
        P --> U[Manage Users];
        P --> V[Site Settings];
        P --> W[Admin Help];
    end

    F --> H;
    G --> H;
    H --> A;
```

## 2. AI-Powered Course Creation Flow (Admin)

This sequence diagram illustrates the process an administrator follows to generate a new course using the AI assistant.

```mermaid
sequenceDiagram
    participant Admin
    participant CreateCoursePage as Create Course UI
    participant GenkitFlow as generateCourseContent Flow
    participant GeminiModel as Google AI Model
    participant ReviewModal as Review & Edit Modal
    participant FirebaseDB as Firebase Database

    Admin->>CreateCoursePage: Enters Course Title & Context
    Admin->>CreateCoursePage: Clicks "Generate & Review"
    CreateCoursePage->>GenkitFlow: Calls flow with title and context
    GenkitFlow->>GeminiModel: Sends structured prompt
    GeminiModel-->>GenkitFlow: Returns full course content (JSON)
    GenkitFlow-->>CreateCoursePage: Returns generated content
    CreateCoursePage->>ReviewModal: Opens modal with generated content
    Admin->>ReviewModal: Reviews and edits content
    Admin->>ReviewModal: Clicks "Save Course"
    ReviewModal->>FirebaseDB: Writes new course data
    FirebaseDB-->>ReviewModal: Confirms save
    ReviewModal-->>Admin: Shows success message
```

## 3. Student Learning Path

This flowchart outlines the journey of a student from enrolling in a course to receiving their certificate.

```mermaid
graph TD
    Start((Start)) --> Enroll{Enroll in Course};
    Enroll -->|Free or Paid| Learn[Enter Course Player];
    Learn --> Lesson{View Lesson & Video};
    Lesson -- Interaction --> Tutor(Ask Gina - AI Tutor)
    Tutor -- Back to Lesson --> Lesson
    Lesson -- Mark as Complete --> Next{More Lessons?};
    Next -- Yes --> Lesson;
    Next -- No --> Exam{Take Final Exam};
    Exam --> Submit[Submit for Grading];
    Submit --> Graded{Wait for Grading};
    Graded --> CheckScore{Check Score >= 80%?};
    CheckScore -- Yes --> Certificate[View/Download Certificate];
    CheckScore -- No --> Retry[Review & Retry Exam];
    Certificate --> End((Finish));
    Retry --> Exam;
```

## 4. AI Tutor Interaction Flow

This diagram shows how a student interacts with the "Gina" AI tutor within the course player.

```mermaid
sequenceDiagram
    participant Student
    participant TutorUI as AI Tutor Interface
    participant GenkitFlow as courseTutor Flow
    participant GeminiModel as Google AI Model

    Student->>TutorUI: Asks a question or clicks "Quiz Me"
    TutorUI->>GenkitFlow: Sends question/action and lesson context
    GenkitFlow->>GeminiModel: Prompts model to answer based on context
    GeminiModel-->>GenkitFlow: Returns formatted answer/quiz
    GenkitFlow-->>TutorUI: Returns answer to display
    TutorUI-->>Student: Shows Gina's response
```

## 5. Roles & Permissions Overview

This diagram provides a high-level view of what different user roles can access and do within the application.

```mermaid
graph LR
    subgraph Guest
        direction LR
        A[Browse Courses]
        B[View Public Pages]
        A & B --> C{Sign Up / Login}
    end

    subgraph Student
        direction LR
        D[Access Dashboard]
        E[Take Courses]
        F[Submit Exams]
        G[Chat with AI Tutor]
        H[Manage Profile]
    end

    subgraph Admin
        direction LR
        I[Full Course Mgmt]
        J[Grade Submissions]
        K[Manage Users]
        L[Manage Site Settings]
        M[View All Data]
    end

    C -- Authenticates to --> Student
    Student -- Is Admin UID --> Admin
```
