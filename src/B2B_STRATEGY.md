# Ubuntu Academy for Business - B2B Strategy

This document outlines the strategy for expanding Ubuntu Academy into the Business-to-Business (B2B) market with a dedicated offering for organizations.

## 1. Vision & Goal

**Vision:** To become the leading corporate training and upskilling platform for organizations in Kenya and beyond, empowering workforces with practical, relevant digital skills.

**Goal:** To create a self-service B2B portal that allows organizations to easily purchase, manage, and track employee training, driving new revenue and user growth for the platform.

## 2. Target Audience

1.  **Corporations:** Businesses of all sizes looking to upskill their employees in areas like digital marketing, software development, and data analysis.
2.  **NGOs & Non-profits:** Organizations seeking affordable training solutions for their staff and beneficiaries.
3.  **Government Entities:** Public sector agencies needing to train civil servants on modern digital practices.
4.  **Educational Institutions:** Universities and colleges looking to supplement their curriculum with practical, job-ready courses.

## 3. Core Features for Organizations

The "Ubuntu for Business" portal will provide a dedicated dashboard for organization administrators with the following features:

-   **User Management:**
    -   Invite employees to join the organization's portal via email.
    -   Remove users who have left the organization.
    -   Assign admin or manager roles to other team members.
-   **License & Course Management:**
    -   Purchase a set number of "seats" or licenses.
    -   Assign specific courses or entire bundles to individual users or teams.
    -   View a catalog of courses available for corporate training.
-   **Reporting & Analytics:**
    -   Track overall course completion rates for the organization.
    -   View progress reports for individual employees.
    -   Identify top-performing learners and popular courses.
-   **Billing & Subscription:**
    -   Manage the organization's subscription tier.
    -   View past invoices and billing history.
    -   Add or remove seats from their plan.

## 4. Proposed Pricing Model

The pricing will be based on a per-seat, per-month model, billed annually.

| Tier        | Price (per user/month) | Target Audience            | Key Features                                                                   |
| :---------- | :--------------------- | :------------------------- | :----------------------------------------------------------------------------- |
| **Team**    | Ksh 1,500              | Small Businesses (5-20 users)   | Access to all courses, basic progress tracking, user management.                |
| **Business**| Ksh 1,200              | Mid-size Companies (21-100 users) | All Team features, plus advanced analytics, custom branding, user groups.      |
| **Enterprise** | Custom Quote        | Large Orgs (100+ users) | All Business features, plus dedicated account manager, API access, custom integrations. |

## 5. User & Authentication Flow

1.  An organization admin signs up through a new "For Business" page.
2.  Their account is created and flagged as an `OrganizationAdmin`.
3.  Upon first login, they are prompted to create their organization profile (name, industry, etc.).
4.  This creates an `organization` entry in the database.
5.  The admin can then access the organization dashboard to manage their team and resources.
6.  Invited employees receive an email. When they sign up, they are automatically associated with the organization.

---

This strategy provides a foundational plan for developing and launching a successful B2B offering.
