# Akili A.I Academy - API Documentation

Welcome to the Akili A.I Academy API documentation. This document provides all the information you need to interact with our platform programmatically.

## 1. Introduction

The Akili A.I Academy API provides access to our course catalog and other platform features. It follows RESTful principles and uses standard HTTP response codes and JSON-formatted responses.

### Base URL

-   **Development:** `http://localhost:9002/`
-   **Production:** `https://your-production-domain.com/`

All API endpoints are relative to this base URL.

## 2. Authentication

API access is controlled via user-generated API keys. Each key is tied to a specific user account and inherits that user's permissions. You must include your API key in the `Authorization` header of your requests.

**Example:**

```http
Authorization: Bearer <YOUR_API_KEY>
```

You can generate and manage your API keys in the [Developer Settings](https://your-app-url/developer) section of your user profile.

## 3. Endpoints

---

### Courses

#### Get All Courses

Retrieves a list of all publicly available courses in the catalog.

-   **URL:** `/api/courses`
-   **Method:** `GET`
-   **Auth Required:** No

**Success Response (200 OK)**

Returns a JSON array of course objects.

**Example Response Body:**

```json
[
  {
    "id": "-NqUvY5oJ7aB9cDefGhi",
    "title": "Introduction to Digital Marketing",
    "instructor": "Aisha Patel",
    "category": "Business",
    "description": "Learn the fundamentals of digital marketing...",
    "longDescription": "This comprehensive course covers everything from SEO and content marketing to social media and analytics...",
    "price": 4999,
    "imageUrl": "https://placehold.co/600x400",
    "duration": "4 Weeks",
    "dripFeed": "daily",
    "createdAt": "2024-05-20T10:00:00.000Z",
    "modules": [
      {
        "id": "module-1",
        "title": "Fundamentals of SEO",
        "lessons": [
          {
            "id": "lesson-1",
            "title": "What is SEO?",
            "duration": "10 min",
            "content": "An introduction to Search Engine Optimization..."
          }
        ]
      }
    ],
    "exam": [
        {
            "id": "q-1",
            "type": "multiple-choice",
            "question": "What does SEO stand for?",
            "options": [
                "Search Engine Optimization",
                "Site Engagement Object",
                "Social Engine Opportunity",
                "Search Entry Object"
            ],
            "correctAnswer": 0,
            "maxPoints": 10
        }
    ]
  }
]
```

**Error Response (500 Internal Server Error)**

If there is an error fetching the data from the server.

**Example Response Body:**
```json
{
  "message": "Internal ServerError"
}
```

---

## 4. Upcoming Endpoints

The following endpoints are planned for future development. Access will require a valid API key.

-   `GET /api/users/me`: Retrieve the profile of the authenticated user.
-   `GET /api/users/me/courses`: Retrieve a list of courses the authenticated user is enrolled in.
-   `GET /api/calendar`: Retrieve a list of all upcoming calendar events.
