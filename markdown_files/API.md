![Akili AI](/public/Akili%20AI.png)
# Akili AI

# Akili A.I Academy - API Documentation

Welcome to the Akili A.I Academy API documentation. This document provides all the information you need to interact with our platform programmatically.

## 1. Introduction

The Akili A.I Academy API provides access to our course catalog and other platform features. It follows RESTful principles and uses standard HTTP response codes and JSON-formatted responses.

### Base URL

-   **Development:** `http://localhost:9002/`
-   **Production:** `https://your-production-domain.com/`

All API endpoints are relative to this base URL.

## 2. Authentication

Currently, the public `/api/courses` endpoint does not require authentication.

For future endpoints that access user-specific or protected data, authentication will be required. This would typically be handled via API keys passed in the `Authorization` header.

**Example (Future Use):**

```http
Authorization: Bearer <YOUR_API_KEY>
```

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
