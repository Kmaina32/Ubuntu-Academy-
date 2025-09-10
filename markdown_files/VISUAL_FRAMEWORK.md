![Akili AI](/public/Akili%20AI.png)
# Akili AI
# Akili A.I Academy - Visual Framework

This document provides a graphical overview of the application\'s structure and key operational flows using Mermaid syntax. These diagrams can be rendered by GitHub or compatible Markdown editors.

## 1. Application Site Map

This diagram shows the main pages of the application and how they are interconnected. It distinguishes between public pages, student-authenticated pages, and the admin section.

```mermaid
graph TD
    subgraph Public Area
        A[Home Page /] --> B[Courses /];
        A --> C[About Us /about];
        A --> D[Contact /contact];
        A --> E[Help /help];
        A --> F[Login /login];
        A --> G[Sign Up /signup];
        A --> SP[Public Portfolio /portfolio/userId];
    end

    subgraph Student Area
        H[Dashboard /dashboard] --> I[Course Player /courses/id/learn];
        H --> J[My Exams /assignments];
        H --> K[My Notebooks /notebook];
        H --> L[Calendar /calendar];
        H --> M[Profile /profile];
        I --> N[Take Final Exam /courses/id/exam];
        B --> O[Course Detail Page /courses/id];
        O --> I;
        M --> SP;
    end

    subgraph "Student Social Features"
        O --> Q[View/Add Reviews];
        O --> R[View/Add Projects to Gallery];
        M --> P[Edit Portfolio];
    end
    
    subgraph Admin Area
        S[Admin Dashboard /admin] --> T[Create Course];
        S --> U[Edit Course];
        S --> V[Manage Assignments];
        S --> W[Grade Submission];
        S --> X[Manage Users];
        S --> Y[Site Settings];
        S --> Z[Admin Help];
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
    TutorUI-->>Student: Shows Gina\'s response
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
## 6. Database Schema (Entity-Relationship Diagram)

This diagram illustrates the main collections in the Firebase Realtime Database and their relationships.

```mermaid
erDiagram
    USERS {
        string uid PK "User ID"
        string email
        string displayName
        string photoURL
        boolean isAdmin "Flag for admin privileges"
        object purchasedCourses "Map of purchased courses"
    }

    COURSES {
        string courseId PK "Course ID"
        string title
        string description
        string instructor
        array modules "List of modules"
        array exam "List of exam questions"
    }

    SUBMISSIONS {
        string submissionId PK "Submission ID"
        string userId FK "User ID"
        string courseId FK "Course ID"
        object answers
        number grade
        string feedback
    }

    USER_NOTES {
        string userId PK, FK "User ID"
        string courseId PK, FK "Course ID"
        string noteContent
    }

    TUTOR_HISTORY {
        string userId PK, FK "User ID"
        string lessonId PK "Lesson ID"
        array chatHistory
    }

    DISCUSSION_THREADS {
        string threadId PK "Thread ID"
        string courseId FK "Course ID"
        string userId FK "User ID"
        string title
        string content
    }

    DISCUSSION_REPLIES {
        string replyId PK "Reply ID"
        string threadId FK "Thread ID"
        string userId FK "User ID"
        string content
    }

    USERS ||--o{ SUBMISSIONS : "submits"
    USERS ||--o{ USER_NOTES : "writes"
    USERS ||--o{ TUTOR_HISTORY : "chats with tutor in"
    USERS ||--o{ DISCUSSION_THREADS : "starts"
    USERS ||--o{ DISCUSSION_REPLIES : "replies to"
    COURSES ||--o{ SUBMISSIONS : "has"
    COURSES ||--o{ USER_NOTES : "has notes for"
    COURSES ||--o{ DISCUSSION_THREADS : "has threads for"
    DISCUSSION_THREADS ||--o{ DISCUSSION_REPLIES : "has replies"

```
## 7. Security and Access Control Flow

This diagram shows how user requests are handled by the Firebase security rules to ensure data is accessed appropriately based on authentication and roles.

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant FirebaseClient as Firebase SDK
    participant FirebaseAuth as Firebase Auth
    participant FirebaseRules as Realtime Database Security Rules
    participant FirebaseDB as Realtime Database

    User->>FirebaseClient: Attempts to read or write data (e.g., `db.ref('/users/some-uid').set(...)`)
    FirebaseClient->>FirebaseAuth: Automatically attaches Auth token to request
    FirebaseAuth-->>FirebaseClient: Token contains user\'s UID
    FirebaseClient->>FirebaseRules: Sends request with path, data, and Auth token

    FirebaseRules->>FirebaseRules: Evaluates rules for the target path

    alt Is Admin?
        FirebaseRules->>FirebaseDB: Checks if `auth.uid` matches an admin UID
        alt Admin Access
            FirebaseRules-->>FirebaseClient: Allows Read/Write
            FirebaseClient->>FirebaseDB: Executes operation
            FirebaseDB-->>FirebaseClient: Returns data or success
            FirebaseClient-->>User: Displays result
        else Not Admin
            FirebaseRules-->>FirebaseClient: Denies Read/Write
            FirebaseClient-->>User: Shows permission denied error
        end
    else Is Standard User?
        FirebaseRules->>FirebaseRules: Checks if `auth.uid` matches the requested resource ID (e.g., `/users/{auth.uid}`)
         alt Own Data Access
            FirebaseRules-->>FirebaseClient: Allows Read/Write
            FirebaseClient->>FirebaseDB: Executes operation
            FirebaseDB-->>FirebaseClient: Returns data or success
            FirebaseClient-->>User: Displays result
        else Other User\'s Data
            FirebaseRules-->>FirebaseClient: Denies Read/Write
            FirebaseClient-->>User: Shows permission denied error
        end
    else Unauthenticated
        FirebaseRules-->>FirebaseClient: Denies Read/Write
        FirebaseClient-->>User: Shows permission denied error
    end
```
## 8. Component Architecture (Next.js)

This diagram illustrates the Next.js component architecture for a key page, the Course Player. It shows how Server Components and Client Components work together to create a seamless user experience, separating static content rendering from dynamic, interactive UI.

```mermaid
graph TD
    subgraph "Next.js Page: /courses/[id]/learn"
        A["CoursePlayerPage (Server Component)"]
        
        subgraph "Client Components (Interactive UI)"
            direction LR
            C["VideoPlayer ('use client')"]
            D["AITutor ('use client')"]
            E["CompletionButton ('use client')"]
        end
        
        subgraph "Server Actions (Server-side Logic)"
            F["courseTutor()"]
            G["updateProgress()"]
        end

        B["LessonList (Server Component)"]

        A -- "Renders" --> B
        A -- "Renders & passes data to" --> C
        A -- "Renders" --> D
        A -- "Renders" --> E

        D -- "Calls" --> F
        E -- "Calls" --> G
    end

    classDef server fill:#D5F5E3,stroke:#27AE60,color:#000
    classDef client fill:#D6EAF8,stroke:#2980B9,color:#000
    classDef action fill:#FCF3CF,stroke:#F39C12,color:#000
    
    class A,B server
    class C,D,E client
    class F,G action
```
