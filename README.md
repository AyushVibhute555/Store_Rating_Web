# Store_Rating_Web

Store Rating Platform (Full-Stack Challenge)

This is a full-stack web application developed using React (Vite) for the frontend, Express.js for the backend API, and MySQL for data persistence. The platform implements a single sign-on system with role-based access control (RBAC) for System Administrators, Store Owners, and Normal Users.

Features by Role

Role

Access Level

Key Functionalities

1. System Administrator

/admin

Dashboard statistics, CRUD for users and stores, centralized listing management with filters/sorting.

2. Normal User

/user

Browse all stores, search by name/address, submit and modify 1-5 star ratings.

3. Store Owner

/owner

Dashboard view of their store's average rating and a list of all users who have submitted ratings.

Tech Stack

Component

Technology

Notes

Frontend

React, Vite

Uses functional components, react-router-dom, and Context API for state management.

Styling

Tailwind CSS

Configured via PostCSS for responsive, utility-first styling.

Backend

Express.js

Implements RESTful API, JWT authentication, and role authorization middleware.

Database

MySQL (with mysql2/promise)

Relational schema with foreign keys and optimized queries for filtering/sorting.

Setup and Installation

Follow these steps to get the application running locally.

1. Database Setup

Ensure MySQL is running on your machine (default port 3306).

Connect to your MySQL instance (via CLI or a tool like MySQL Workbench).

Run the database.sql script (located in the project root) to create the store_rating_db database and all required tables.

2. Backend Setup (Express.js)

Navigate to the backend directory.

cd backend


Install dependencies:

npm install


Crucially, open backend/config/db.js and update the database connection password:

// backend/config/db.js
// ...
password: 'YOUR_MYSQL_PASSWORD', // <<< UPDATE THIS LINE
// ...


Start the API server:

npm start


The API will be accessible at http://localhost:5000.

3. Frontend Setup (React/Vite)

Navigate to the frontend directory.

cd ../frontend


Install dependencies (including all React and Tailwind packages):

npm install


Start the development server:

npm run dev


The application will typically open at http://localhost:5173.

Testing Credentials

For a complete test of all features, you should have users for all three roles.

Role

Email

Password

Setup Method

System Administrator

admin@test.com

AdminPassword!123

Inserted manually via SQL (see below).

Normal User

user@test.com

UserPassword!123

Use the /register page.

Store Owner

(User-defined)

(User-defined)

Must be created by the Admin via the "Add Store" feature.

Initial Admin SQL Insert

Run this command in your MySQL client to create the Admin account required for system management:

-- Password is 'AdminPassword!123'
INSERT INTO users (name, email, password, address, role) 
VALUES ('System Administrator User', 'admin@test.com', '$2a$10$tT1d7YqfB8P7R.R/q9wPz.O/V8p1yG5fC9e9gX1k7y3K8F0W9/h8X', 'Admin HQ, Test City', 1);
