# DocFlow API - Postman Collection

This directory contains Postman collections and environment files for testing the DocFlow API.

## Files

- `DocFlow_API.postman_collection.json` - Complete API collection with all endpoints
- `DocFlow_Environment.postman_environment.json` - Environment variables for different environments

## Import Instructions

### 1. Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select `DocFlow_API.postman_collection.json`
4. Click **Import**

### 2. Import Environment

1. In Postman, click the **Environments** icon (left sidebar)
2. Click **Import**
3. Select `DocFlow_Environment.postman_environment.json`
4. Click **Import**
5. Select the environment from the dropdown (top right) to activate it

## Collection Structure

The collection is organized into the following folders:

### 📋 Patients
- **Create Patient** - POST `/api/patients`
- **Get All Patients** - GET `/api/patients` (with search & pagination)
- **Get Patient by ID** - GET `/api/patients/:id`
- **Update Patient** - PATCH `/api/patients/:id`
- **Delete Patient** - DELETE `/api/patients/:id`

### 📅 Appointments
- **Create Appointment** - POST `/api/appointments`
- **Get All Appointments** - GET `/api/appointments` (with filters & pagination)
- **Get Appointments by Patient** - GET `/api/appointments/patient/:patientId`
- **Get Appointments by Date** - GET `/api/appointments/date/:date`
- **Get Appointment by ID** - GET `/api/appointments/:id`
- **Update Appointment** - PATCH `/api/appointments/:id`
- **Delete Appointment** - DELETE `/api/appointments/:id`

### 🏥 Medical Records
- **Create Medical Record** - POST `/api/medical-records/patient/:patientId`
- **Get Medical Records by Patient** - GET `/api/medical-records/patient/:patientId`
- **Get Medical Record by ID** - GET `/api/medical-records/:id`
- **Update Medical Record** - PATCH `/api/medical-records/:id`
- **Delete Medical Record** - DELETE `/api/medical-records/:id`

### 🔔 Notifications
- **Create Notification** - POST `/api/notifications`
- **Get All Notifications** - GET `/api/notifications` (with filters & pagination)
- **Get Notification by ID** - GET `/api/notifications/:id`
- **Mark Notification as Read** - PATCH `/api/notifications/:id/read`
- **Mark All Notifications as Read** - PATCH `/api/notifications/read-all`
- **Delete Notification** - DELETE `/api/notifications/:id`

### 📊 Dashboard
- **Get Dashboard Stats** - GET `/api/dashboard/stats`

## Environment Variables

The environment file includes the following variables:

- `baseUrl` - API base URL (default: `http://localhost:3000`)
- `patientId` - Store patient ID for reuse
- `appointmentId` - Store appointment ID for reuse
- `medicalRecordId` - Store medical record ID for reuse
- `notificationId` - Store notification ID for reuse

## Usage Tips

### 1. Update Base URL
If your API runs on a different port or host, update the `baseUrl` variable in the environment.

### 2. Using Path Variables
Many endpoints use path variables (e.g., `:id`, `:patientId`). You can:
- Replace them directly in the URL
- Use environment variables
- Use collection variables

### 3. Testing Workflow
Recommended testing order:
1. Create a patient
2. Use the patient ID to create an appointment
3. Create a medical record for the patient
4. Create notifications
5. Test queries and filters
6. Test updates and deletes

### 4. Appointment Types
Valid appointment types:
- `checkup`
- `cleaning`
- `procedure`
- `consultation`
- `emergency`
- `follow-up`

### 5. Appointment Status
Valid appointment statuses:
- `scheduled`
- `confirmed`
- `completed`
- `cancelled`
- `no-show`

### 6. Notification Types
Valid notification types:
- `appointment`
- `reminder`
- `alert`
- `info`

## Example Request Bodies

### Create Patient
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "dateOfBirth": "1985-05-15",
  "address": "123 Main St, New York, NY 10001",
  "notes": "Regular patient"
}
```

### Create Appointment
```json
{
  "patientId": "uuid-here",
  "date": "2024-12-20",
  "time": "09:00:00",
  "duration": 30,
  "type": "checkup",
  "status": "scheduled",
  "notes": "Regular checkup"
}
```

### Create Medical Record
```json
{
  "date": "2024-12-18",
  "diagnosis": "Cavity in upper left molar",
  "treatment": "Filled cavity with composite resin",
  "notes": "Patient responded well to treatment",
  "attachments": []
}
```

### Create Notification
```json
{
  "title": "Appointment Reminder",
  "message": "You have an appointment scheduled for tomorrow",
  "type": "reminder"
}
```

## Query Parameters

### Pagination
Most list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filters
- **Patients**: `search` - Search by name or email
- **Appointments**: `date`, `patientId`, `status`, `startDate`, `endDate`
- **Notifications**: `read` (true/false), `type`

## Notes

- All dates should be in `YYYY-MM-DD` format
- All times should be in `HH:MM:SS` format (24-hour)
- UUIDs are used for all IDs
- The API uses a global prefix `/api` for all routes
- CORS is enabled for `http://localhost:5173` by default

## Troubleshooting

### Connection Issues
- Ensure your backend server is running
- Check that the `baseUrl` in the environment matches your server URL
- Verify the port (default: 3000)

### Validation Errors
- Check that required fields are provided
- Verify date formats (YYYY-MM-DD)
- Ensure enum values match valid options
- Check email format for patient email

### 404 Errors
- Verify the API is running
- Check that the global prefix `/api` is included in URLs
- Ensure route paths match exactly (case-sensitive)

