# 🔌 BidSphere AI — REST API Documentation

This document provides a comprehensive specification of all REST API endpoints exposed by the BidSphere AI backend server.

---

## 🔑 Authentication & Authorization

All protected endpoints require an JSON Web Token (JWT). The token must be provided in either:
1. The `Authorization` header using the standard bearer scheme:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
2. A secure HTTP-Only cookie named `token` (if configured in production client).

### 👥 User Roles & Permissions
Different endpoints enforce role-based access control (RBAC). The following roles are available:
* `admin`: Complete read, write, update, delete, and user management control.
* `manager`: Read and write control for bids, view performance dashboards, but cannot edit user listings.
* `sales`: Read and write control only for self-created bids; cannot delete bids.

---

## 🔒 Authentication API (`/api/auth`)

### 1. Register User
* **Endpoint:** `POST /api/auth/signup`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@company.com",
    "password": "Password123!",
    "role": "sales"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d07f1f772ba8c1244e8a1c",
      "name": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "sales"
    }
  }
  ```

### 2. Login User
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "jane.doe@company.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d07f1f772ba8c1244e8a1c",
      "name": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "sales"
    }
  }
  ```

### 3. Get Current User Profile
* **Endpoint:** `GET /api/auth/me`
* **Access:** Protected
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60d07f1f772ba8c1244e8a1c",
      "name": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "sales",
      "permissions": ["create-bids", "access-bids"]
    }
  }
  ```

---

## 📋 Bids Management API (`/api/bids`)

### 1. Get Bids (Paginated, Filtered, Sorted)
* **Endpoint:** `GET /api/bids`
* **Access:** Protected
* **Query Parameters:**
  * `page` (number, default: 1) - The page number.
  * `limit` (number, default: 10) - Results per page.
  * `sort` (string, default: `-createdAt`) - Field to sort by. Use a minus prefix for descending order.
  * `status` (string, options: `Draft`, `Review`, `Approved`, `Submitted`, `Won`, `Lost`) - Filter by bid phase.
  * `search` (string) - Search text matching title or client name.
  * `valueMin` / `valueMax` (number) - Range filtering for budget value.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 48,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "nextPage": 2
    },
    "data": [
      {
        "_id": "65bfa78f0d8a571ea00d8b4e",
        "title": "Cloud Migration RFP",
        "clientName": "Globex Corp",
        "value": 450000,
        "status": "Review",
        "submissionDeadline": "2026-06-30T00:00:00.000Z",
        "owner": "60d07f1f772ba8c1244e8a1c",
        "createdAt": "2026-05-20T10:15:30.000Z"
      }
    ]
  }
  ```

### 2. Create Bid
* **Endpoint:** `POST /api/bids`
* **Access:** Protected (`admin`, `manager`, `sales`)
* **Request Body:**
  ```json
  {
    "title": "Database Optimization Contract",
    "clientName": "Acme Systems",
    "value": 125000,
    "status": "Draft",
    "submissionDeadline": "2026-07-15T18:00:00.000Z",
    "description": "Standard optimization contract for PostgreSQL clusters."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "65c3b90a0d8a571ea00d8b5a",
      "title": "Database Optimization Contract",
      "clientName": "Acme Systems",
      "value": 125000,
      "status": "Draft",
      "owner": "60d07f1f772ba8c1244e8a1c",
      "createdAt": "2026-05-22T04:45:00.000Z"
    }
  }
  ```

### 3. Update Bid
* **Endpoint:** `PUT /api/bids/:id`
* **Access:** Protected
* **Request Body:**
  ```json
  {
    "status": "Approved",
    "value": 130000
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "65c3b90a0d8a571ea00d8b5a",
      "title": "Database Optimization Contract",
      "clientName": "Acme Systems",
      "value": 130000,
      "status": "Approved",
      "updatedAt": "2026-05-22T04:55:00.000Z"
    }
  }
  ```

### 4. Delete Bid
* **Endpoint:** `DELETE /api/bids/:id`
* **Access:** Protected (`admin`, `manager` only)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Bid deleted successfully"
  }
  ```

---

## 🧠 AI Integration API (`/api/ai`)

### 1. Test Gemini Connection
* **Endpoint:** `GET /api/ai/test`
* **Access:** Public
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Gemini API Handshake successful. Model is operational."
  }
  ```

### 2. Generate Portfolio Summary Report
* **Endpoint:** `GET /api/ai/project-summary`
* **Access:** Protected
* **Description:** Compiles data from active MongoDB collections and passes them to Gemini to receive an executive-grade narrative of current sales pipeline health, bottlenecks, and win predictions.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "summary": "### Executive Pipeline Summary\nOur current pipeline value sits at $2.4M across 15 active opportunities. We observe a velocity clustering in the 'Review' stage, indicating legal bottlenecks on 3 primary proposals. Recommended actions: Fast-track Acme contract review..."
  }
  ```

### 3. Smart Recommendations Engine
* **Endpoint:** `GET /api/ai/smart-actions`
* **Access:** Protected
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "actions": [
      {
        "priority": "High",
        "action": "Initiate review for Globex Cloud Bid",
        "reason": "Deadline is approaching in less than 4 days and legal approval is pending."
      }
    ]
  }
  ```

### 4. Contextual Database Chat
* **Endpoint:** `POST /api/ai/chat`
* **Access:** Protected
* **Request Body:**
  ```json
  {
    "message": "Give me a breakdown of all bids worth more than $200k along with their status."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "response": "Here is the breakdown of bids over $200,000:\n\n1. **Cloud Migration RFP** - Globex Corp ($450,000) - Status: **Review**\n2. **Enterprise ERP Ingest** - Stark Industries ($350,000) - Status: **Draft**"
  }
  ```

---

## 🔔 Notifications API (`/api/notifications`)

### 1. Get User Notifications
* **Endpoint:** `GET /api/notifications`
* **Access:** Protected
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "65bfa78f0d8a571ea00d890a",
        "message": "Bid 'Cloud Migration RFP' status changed to Review by Admin",
        "isRead": false,
        "createdAt": "2026-05-21T18:00:00.000Z"
      }
    ]
  }
  ```

### 2. Mark All as Read
* **Endpoint:** `PUT /api/notifications/read-all`
* **Access:** Protected
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "All notifications marked as read."
  }
  ```

---

## 🗃️ Audit Logging API (`/api/audit-logs`)

### 1. Retrieve Audit Trails
* **Endpoint:** `GET /api/audit-logs`
* **Access:** Protected (`admin` only)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 150,
    "data": [
      {
        "_id": "65c2a1a00d8a571ea00f7c22",
        "action": "UPDATE_BID",
        "entity": "Bid",
        "entityId": "65bfa78f0d8a571ea00d8b4e",
        "performedBy": {
          "_id": "60d07f1f772ba8c1244e8a1c",
          "name": "Jane Doe"
        },
        "details": {
          "previousStatus": "Draft",
          "newStatus": "Review"
        },
        "ipAddress": "192.168.1.15",
        "createdAt": "2026-05-22T04:55:00.000Z"
      }
    ]
  }
  ```
