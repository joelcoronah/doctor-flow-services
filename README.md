# DocFlow Schedule Backend API

Backend API service for the DocFlow Schedule application built with NestJS and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Development](#development)

## 🎯 Overview

This backend service provides a RESTful API for managing:
- **Patients**: Patient registration, profiles, and information management
- **Appointments**: Scheduling, updating, and managing appointments
- **Medical Records**: Patient medical history and treatment records
- **Notifications**: System notifications and alerts
- **Dashboard**: Statistics and overview data

## 🛠 Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Authentication**: JWT (ready for implementation)
- **API Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
backend-services/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── config/                 # Configuration files
│   │   └── database.config.ts
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── interceptors/
│   ├── patients/               # Patients module
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   └── patients.module.ts
│   ├── appointments/           # Appointments module
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── appointments.controller.ts
│   │   ├── appointments.service.ts
│   │   └── appointments.module.ts
│   ├── medical-records/        # Medical records module
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── medical-records.controller.ts
│   │   ├── medical-records.service.ts
│   │   └── medical-records.module.ts
│   ├── notifications/         # Notifications module
│   │   ├── entities/
│   │   ├── dto/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.module.ts
│   └── dashboard/             # Dashboard module
│       ├── dto/
│       ├── dashboard.controller.ts
│       ├── dashboard.service.ts
│       └── dashboard.module.ts
├── test/                      # Test files
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 15+ installed and running
- Git

### Installation

1. **Clone the repository** (if not already done):
```bash
cd backend-services
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=docflow_schedule
```

4. **Run database migrations**:
```bash
npm run migration:run
```

5. **Start the development server**:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Patients

#### Get All Patients
```http
GET /api/patients
Query Parameters:
  - search?: string (search by name, email, phone)
  - page?: number (default: 1)
  - limit?: number (default: 10)
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "dateOfBirth": "1990-01-15",
      "address": "123 Main St",
      "notes": "Patient notes",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### Get Patient by ID
```http
GET /api/patients/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St",
  "notes": "Patient notes",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "medicalHistory": []
}
```

#### Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St",
  "notes": "Patient notes"
}
```

#### Update Patient
```http
PUT /api/patients/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  ...
}
```

#### Delete Patient
```http
DELETE /api/patients/:id
```

### Appointments

#### Get All Appointments
```http
GET /api/appointments
Query Parameters:
  - date?: string (YYYY-MM-DD)
  - patientId?: string
  - status?: scheduled | confirmed | completed | cancelled | no-show
  - startDate?: string (YYYY-MM-DD)
  - endDate?: string (YYYY-MM-DD)
  - page?: number
  - limit?: number
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "John Doe",
      "date": "2024-01-15",
      "time": "09:00",
      "duration": 30,
      "type": "checkup",
      "status": "confirmed",
      "notes": "Regular checkup",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### Get Appointment by ID
```http
GET /api/appointments/:id
```

#### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "patientId": "uuid",
  "date": "2024-01-15",
  "time": "09:00",
  "duration": 30,
  "type": "checkup",
  "notes": "Regular checkup"
}
```

#### Update Appointment
```http
PUT /api/appointments/:id
Content-Type: application/json

{
  "date": "2024-01-16",
  "time": "10:00",
  "status": "confirmed",
  ...
}
```

#### Delete Appointment
```http
DELETE /api/appointments/:id
```

#### Get Appointments by Patient
```http
GET /api/appointments/patient/:patientId
```

#### Get Appointments by Date
```http
GET /api/appointments/date/:date
```

### Medical Records

#### Get Patient Medical Records
```http
GET /api/medical-records/patient/:patientId
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "date": "2024-01-01",
      "diagnosis": "Routine checkup",
      "treatment": "Cleaning and fluoride",
      "notes": "No cavities found",
      "attachments": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Medical Record
```http
POST /api/medical-records/patient/:patientId
Content-Type: application/json

{
  "date": "2024-01-01",
  "diagnosis": "Routine checkup",
  "treatment": "Cleaning and fluoride",
  "notes": "No cavities found",
  "attachments": []
}
```

#### Update Medical Record
```http
PUT /api/medical-records/:id
Content-Type: application/json

{
  "diagnosis": "Updated diagnosis",
  "treatment": "Updated treatment",
  ...
}
```

#### Delete Medical Record
```http
DELETE /api/medical-records/:id
```

### Notifications

#### Get All Notifications
```http
GET /api/notifications
Query Parameters:
  - read?: boolean
  - type?: appointment | reminder | alert | info
  - page?: number
  - limit?: number
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Upcoming Appointment",
      "message": "Patient has appointment tomorrow",
      "type": "appointment",
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

#### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
```

#### Delete Notification
```http
DELETE /api/notifications/:id
```

### Dashboard

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "todayAppointments": 3,
  "weekAppointments": 12,
  "totalPatients": 156,
  "pendingFollowUps": 8
}
```

## 🗄 Database Schema

### Patients Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) (Required)
- email: VARCHAR(255) (Required, Unique)
- phone: VARCHAR(50) (Required)
- dateOfBirth: DATE
- address: TEXT
- notes: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Appointments Table
```sql
- id: UUID (Primary Key)
- patientId: UUID (Foreign Key -> Patients)
- date: DATE (Required)
- time: TIME (Required)
- duration: INTEGER (Required, default: 30)
- type: ENUM (checkup, cleaning, procedure, consultation, emergency, follow-up)
- status: ENUM (scheduled, confirmed, completed, cancelled, no-show)
- notes: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Medical Records Table
```sql
- id: UUID (Primary Key)
- patientId: UUID (Foreign Key -> Patients)
- date: DATE (Required)
- diagnosis: VARCHAR(500) (Required)
- treatment: TEXT (Required)
- notes: TEXT
- attachments: JSONB (Array of file paths/URLs)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Notifications Table
```sql
- id: UUID (Primary Key)
- title: VARCHAR(255) (Required)
- message: TEXT (Required)
- type: ENUM (appointment, reminder, alert, info)
- read: BOOLEAN (Default: false)
- createdAt: TIMESTAMP
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=docflow_schedule

# Application
PORT=3000
NODE_ENV=development

# JWT (for future authentication)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Database
npm run migration:generate  # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Database Migrations

TypeORM migrations are used to manage database schema changes:

```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### API Documentation

Once the server is running, Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

## 📝 Notes

- All timestamps are in UTC
- All IDs are UUIDs
- Date formats: YYYY-MM-DD
- Time formats: HH:mm (24-hour format)
- Pagination defaults: page=1, limit=10
- All endpoints return JSON

## 🔄 Integration with Frontend

The frontend application (in `docflow-schedule`) should be configured to use this API:

```typescript
// Example API configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Example fetch
fetch(`${API_BASE_URL}/patients`)
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🚧 Future Enhancements

- [ ] JWT Authentication and Authorization
- [ ] File upload for medical record attachments
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Appointment reminders
- [ ] Advanced search and filtering
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Caching layer (Redis)

## 📄 License

This project is part of the DocFlow portfolio application.

