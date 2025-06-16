# Room Management Backend

This is the backend for the University Room Management App.

## Tech Stack
- Node.js
- Express.js
- PostgreSQL (with migrations)
- JWT Authentication
- MVC Pattern

## Features
- RESTful API for rooms, students, users, authentication, and payments
- Role-based access (admin/student)
- CORS enabled for web/mobile
- Error handling and validation

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env`
3. Run migrations: `npm run migrate`
4. Start server: `npm run dev`

Admin credentials are seeded in the database during migration.
