# 🏪 Store Rating Platform (Full-Stack Challenge)

This is a full-stack web application developed using **React (Vite)**
for the frontend, **Express.js** for the backend API, and **MySQL** for
data persistence.\
The platform includes **single sign-on** with **role-based access
control (RBAC)** for **System Administrators**, **Store Owners**, and
**Normal Users**.

------------------------------------------------------------------------

## 🔐 Features by Role

  ---------------------------------------------------------------------------
  **Role**          **Access Level**        **Key Functionalities**
  ----------------- ----------------------- ---------------------------------
  **System          `/admin`                Dashboard statistics, CRUD for
  Administrator**                           users and stores, centralized
                                            listing management with
                                            filters/sorting.

  **Normal User**   `/user`                 Browse all stores, search by
                                            name/address, submit and modify
                                            1--5 star ratings.

  **Store Owner**   `/owner`                Dashboard view of their store's
                                            average rating and a list of all
                                            users who have submitted ratings.
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

## ⚙️ Tech Stack

  -------------------------------------------------------------------------
  **Component**             **Technology**            **Notes**
  ------------------------- ------------------------- ---------------------
  **Frontend**              React, Vite               Uses functional
                                                      components,
                                                      `react-router-dom`,
                                                      and Context API for
                                                      state management.

  **Styling**               Tailwind CSS              Configured via
                                                      PostCSS for
                                                      responsive,
                                                      utility-first
                                                      styling.

  **Backend**               Express.js                Implements RESTful
                                                      API, JWT
                                                      authentication, and
                                                      role authorization
                                                      middleware.

  **Database**              MySQL                     Relational schema
                                                      with foreign keys and
                                                      optimized queries for
                                                      filtering/sorting.
  -------------------------------------------------------------------------

------------------------------------------------------------------------

## 🚀 Setup and Installation

Follow these steps to get the application running locally.

------------------------------------------------------------------------

### 1. Database Setup

1.  Ensure **MySQL** is running on your machine (default port `3306`).
2.  Connect to your MySQL instance (via CLI or a tool like **MySQL
    Workbench**).
3.  Run the `database.sql` script (located in the project root) to
    create the `store_rating_db` database and all required tables.

------------------------------------------------------------------------

### 2. Backend Setup (Express.js)

``` bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

Then update your database password in **backend/config/db.js**:

``` js
// backend/config/db.js
password: 'YOUR_MYSQL_PASSWORD', // <<< UPDATE THIS LINE
```

Start the API server:

``` bash
npm start
```

> The API will be accessible at <http://localhost:5000>.

------------------------------------------------------------------------

### 3. Frontend Setup (React/Vite)

``` bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> The app will typically open at <http://localhost:5173>.

------------------------------------------------------------------------

## 👥 Testing Credentials

  ---------------------------------------------------------------------------------
  **Role**          **Email**          **Password**          **Setup Method**
  ----------------- ------------------ --------------------- ----------------------
  **System          `admin@test.com`   `AdminPassword!123`   Inserted manually via
  Administrator**                                            SQL (see below).

  **Normal User**   `user@test.com`    `UserPassword!123`    Use the `/register`
                                                             page.

  **Store Owner**   (User-defined)     (User-defined)        Must be created by
                                                             Admin via **Add
                                                             Store** feature.
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

## 🧩 Initial Admin SQL Insert

Run this SQL command in your MySQL client to create the admin account
required for system management.\
The password is pre-hashed for **`AdminPassword!123`**:

``` sql
-- Password is 'AdminPassword!123'

INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator User',
  'admin@test.com',
  '$2a$10$tT1d7YqfB8P7R.R/q9wPz.O/V8p1yG5fC9e9gX1k7y3K8F0W9/h8X',
  'Admin HQ, Test City',
  1
);
```

