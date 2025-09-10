
# Akili AI - Visual Framework

This document provides a visual representation of the application's architecture, user flows, and component interactions using Mermaid diagrams.

## High-Level Architecture
This diagram provides a bird's-eye view of the entire application stack. It shows the main layers: the client-side (what the user sees in their browser), the server-side (our Next.js backend), the backend services (Firebase and Genkit), and the AI/ML layer (Google AI Platform). It illustrates the primary flow of data and control between these major components.

```mermaid
graph TD
    subgraph CLIENT ["Client (Next.js/React)"]
        A["User Interface"] --> B{"React Components"};
        B --> C["ShadCN UI"];
        B --> D["Tailwind CSS"];
        A --> E["Next.js App Router"];
    end

    subgraph SERVER ["Server-Side (Next.js)"]
        E --> F["Server Components"];
        E --> G["Server Actions"];
    end

    subgraph BACKEND ["Backend Services"]
        H["Firebase Auth"]
        I["Firebase Realtime DB"]
        J["Genkit AI Flows"]
    end

    G --> H;
    G --> I;
    G --> J;

    F --> I;

    subgraph AIML ["AI/ML (Genkit)"]
        J --> K["Google AI Platform"];
    end

    style CLIENT fill:#D6EAF8,stroke:#333,stroke-width:2px
    style SERVER fill:#D1F2EB,stroke:#333,stroke-width:2px
    style BACKEND fill:#FCF3CF,stroke:#333,stroke-width:2px
    style AIML fill:#FDEDEC,stroke:#333,stroke-width:2px
```

## Component Architecture Diagram
This diagram shows how different UI components interact and form the user interface. It is organized into three main categories: Pages (which represent different routes), Shared Components (reusable elements like headers and footers), and UI Primitives (the basic building blocks from ShadCN). This helps visualize how the frontend is constructed in a modular way.

```mermaid
graph TD
    subgraph PAGES ["Pages"]
        P1["Course Player Page"]
        P2["Admin Dashboard"]
        P3["Home Page"]
    end

    subgraph SHARED ["Shared Components"]
        C1["Header"]
        C2["Footer"]
        C3["Sidebar"]
        C4["CourseCard"]
        C5["MpesaModal"]
    end

    subgraph PRIMITIVES ["UI Primitives (ShadCN)"]
        U1["Button"]
        U2["Card"]
        U3["Dialog"]
        U4["Input"]
    end

    P1 --> C1;
    P1 --> C2;
    P1 --> C3;
    P2 --> C1;
    P2 --> C2;
    P2 --> C3;
    P3 --> C1;
    P3 --> C2;
    P3 --> C4;

    C4 --> U1;
    C4 --> U2;
    C5 --> U3;
    C5 --> U1;
    C5 --> U4;
    P1 --> U1;
    P2 --> U2;

    style PAGES fill:#E8DAEF,stroke:#333,stroke-width:2px
    style SHARED fill:#D4E6F1,stroke:#333,stroke-width:2px
    style PRIMITIVES fill:#D6EFE5,stroke:#333,stroke-width:2px
```

## Security Visual Framework
This diagram illustrates the security layers, from user authentication to database access rules. It shows how a user's request is authenticated via Firebase Authentication, resulting in a token that is used to make secure requests to the backend. The backend then relies on Firebase's Database Security Rules to ensure that users can only access the data they are authorized to see.

```mermaid
graph LR
    A[User] -->|HTTPS| B(Next.js Frontend);

    subgraph FIREBASE [Firebase]
        C["Firebase Authentication"]
        D["Firebase Realtime DB"]
        E["Database Security Rules"]
    end

    B -->|"Login/Signup"| C;
    C -->|"Auth Token (JWT)"| B;
    B -->|"Server Actions"| F["Next.js Backend"];
    F -->|"Authenticated Requests"| D;
    D -- "Enforces" --> E;
    E -- "Defines Access" --> D;

    style FIREBASE fill:#FDEBD0,stroke:#F39C12,stroke-width:2px
```

## Cyber Security Threat Model
This diagram illustrates potential threats and the implemented mitigations at different layers of the application. It maps common attack types (Threat Vectors) like Cross-Site Scripting (XSS) and Insecure Direct Object References (IDOR) to the specific architectural layers they target. Most importantly, it shows the corresponding security measures (Mitigations) that have been implemented to defend against these threats.

```mermaid
graph TD
    subgraph THREATS ["Threat Vectors"]
        A["External Attacker"]
        B["Malicious User"]
    end
    
    subgraph LAYERS ["Application Layers"]
        C["Next.js Frontend"]
        D["Next.js Backend / Server Actions"]
        E["Firebase Services"]
        F["Database"]
    end
    
    A -->|"XSS, CSRF"| C
    A -->|DDoS| C
    A -->|"API Abuse"| D
    B -->|IDOR| D
    B -->|"Unauthorized Access"| E
    
    subgraph MITIGATIONS ["Mitigations"]
        M1("Input Sanitization, reCAPTCHA")
        M2("Firebase Hosting DDoS Protection")
        M3("Rate Limiting, Auth Middleware")
        M4("DB Rules: auth.uid checks")
        M5("DB Rules: isAdmin checks")
    end
    
    C -- "Mitigated by" --> M1
    C -- "Mitigated by" --> M2
    D -- "Mitigated by" --> M3
    D -- "Mitigated by" --> M4
    E -- "Mitigated by" --> M5
    
    style THREATS fill:#F5B7B1,stroke:#333,stroke-width:2px
    style MITIGATIONS fill:#A9DFBF,stroke:#333,stroke-width:2px
```

## Data Analytics Flow
This diagram shows the flow of data from user actions to the analytics dashboard. It begins with a user performing an action (like enrolling in a course), which triggers a server action to save data to the Firebase Database. The analytics page then fetches this raw data, processes it into meaningful aggregates (like totals and counts), and finally displays it in the dashboard's charts and cards.

```mermaid
graph LR
    subgraph ACTION ["User Action"]
        A["User Action (e.g., Signup, Enroll)"]
    end
    
    subgraph SERVER ["Server-Side Logic"]
        B{"Next.js Server Action"}
    end

    subgraph DATABASE ["Database"]
         C["Firebase Realtime DB (/users, /courses)"]
    end
    
    A --> B;
    B --> C;
    
    subgraph ANALYTICS ["Analytics Process"]
        D["Admin Analytics Page"] --> E{"fetchAnalytics()"};
        E -->|"getAllUsers(), getAllCourses()"| C;
        E --> F["Process Data (Count totals, Aggregate signups)"];
        F --> G["Display in Charts & Cards"];
    end
    
    D --> G;

    style ANALYTICS fill:#D6EAF8,stroke:#333,stroke-width:1px
```

## Database Framework
This diagram shows a simplified version of the Firebase Realtime Database schema and the relationships between different data entities. It uses an Entity-Relationship (ER) format to define the main data nodes (Users, Courses, Submissions, Organizations) and illustrates how they are connected, such as a User submitting a Submission for a Course.

```mermaid
erDiagram
    USERS {
        string uid PK "User ID"
        string email "Email"
        string displayName "Display Name"
        bool isAdmin "Is Admin"
        string organizationId FK "Organization ID"
    }

    COURSES {
        string courseId PK "Course ID"
        string title "Title"
        string description "Description"
        array modules "Modules"
    }

    SUBMISSIONS {
        string submissionId PK "Submission ID"
        string userId FK "User ID"
        string courseId FK "Course ID"
        string submittedAt "Submitted At"
        bool graded "Graded"
    }

    ORGANIZATIONS {
        string orgId PK "Organization ID"
        string name "Name"
        string ownerId FK "Owner ID"
    }

    USERS ||--o{ SUBMISSIONS : "submits"
    COURSES ||--o{ SUBMISSIONS : "for"
    USERS }|--|| ORGANIZATIONS : "belongs-to"
```
