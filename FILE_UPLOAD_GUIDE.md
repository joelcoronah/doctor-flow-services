# Medical Record File Upload System

## Overview

This system allows uploading multiple files (PDFs, images, documents) to medical records. Files are stored as **base64 encoded data in the PostgreSQL database**, making them easy to backup, portable, and eliminating the need for file system management.

## Features

- ✅ Upload multiple files (up to 5 at once)
- ✅ Supported formats: PDF, Images (JPG, PNG, GIF), Word, Excel, Text
- ✅ File size limit: 10MB per file
- ✅ Drag-and-drop interface
- ✅ Download files
- ✅ Delete files
- ✅ Files automatically deleted when medical record is deleted (CASCADE)

## API Endpoints

### Upload Single File
```
POST /api/medical-records/:medicalRecordId/files/upload
Content-Type: multipart/form-data
Body: file (File)
```

### Upload Multiple Files
```
POST /api/medical-records/:medicalRecordId/files/upload-multiple
Content-Type: multipart/form-data
Body: files[] (File[])
```

### Get All Files for a Medical Record
```
GET /api/medical-records/:medicalRecordId/files
```

### Download a File
```
GET /api/medical-records/:medicalRecordId/files/file/:fileId
```

### Delete a File
```
DELETE /api/medical-records/:medicalRecordId/files/file/:fileId
```

## Database Schema

### medical_record_files Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| medicalRecordId | UUID | Foreign key to medical_records |
| originalName | VARCHAR(255) | Original filename from upload |
| mimeType | VARCHAR(100) | File MIME type |
| fileSize | BIGINT | File size in bytes |
| fileData | TEXT | Base64 encoded file content |
| uploadedAt | TIMESTAMP | Upload timestamp |

## File Storage

Files are stored as **base64 encoded strings** in the PostgreSQL database.

### Why Base64 in Database?

**Advantages:**
- ✅ No file system management needed
- ✅ Easy database backups (everything in one place)
- ✅ Portable across servers
- ✅ No file permission issues
- ✅ Automatic cleanup with CASCADE deletes
- ✅ Transactional consistency

**Trade-offs:**
- ⚠️ ~33% larger storage than binary (base64 overhead)
- ⚠️ Not ideal for files > 10MB (but we limit to 10MB anyway)
- ⚠️ Database size increases with files

## Security Considerations

- File type validation (whitelist approach)
- File size limits enforced (10MB max)
- Files stored in database (secure, no direct file system access)
- Base64 encoding prevents file execution
- Cascade delete ensures orphaned files are removed
- No file path traversal vulnerabilities

## Frontend Integration

The frontend provides:
- **FileUploader Component**: Drag-and-drop interface
- **FileList Component**: Display and manage files
- **React Query Hooks**: Automatic cache invalidation
- **Download Functionality**: One-click downloads
- **Delete Functionality**: Remove files with confirmation

## Usage Example

```typescript
// Upload files when creating a medical record
const handleAddMedicalRecord = async (data, files) => {
  // 1. Create medical record
  const record = await createMedicalRecord(data);
  
  // 2. Upload files
  if (files.length > 0) {
    await uploadFiles(record.id, files);
  }
};

// Display files in UI
<FileList
  files={medicalRecord.files}
  medicalRecordId={medicalRecord.id}
  onDelete={handleDeleteFile}
/>
```

## Configuration

### Change File Size Limit

In `medical-record-files.controller.ts`:
```typescript
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
```

### Change Allowed File Types

In `medical-record-files.controller.ts`:
```typescript
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  // Add more types...
];
```

## Maintenance

### Backup Files
Files are stored in the database, so regular PostgreSQL backups will include all files automatically.

### Database Size Monitoring
Monitor database size as files accumulate:
```sql
-- Check total file storage size
SELECT 
  pg_size_pretty(SUM(LENGTH(fileData))) as total_file_size,
  COUNT(*) as file_count
FROM medical_record_files;

-- Check largest files
SELECT 
  originalName,
  pg_size_pretty(LENGTH(fileData)) as file_size,
  uploadedAt
FROM medical_record_files
ORDER BY LENGTH(fileData) DESC
LIMIT 10;
```

### Cleanup Orphaned Files
The CASCADE delete handles this automatically, but you can verify:
```sql
SELECT * FROM medical_record_files mrf
WHERE NOT EXISTS (
  SELECT 1 FROM medical_records mr
  WHERE mr.id = mrf."medicalRecordId"
);
```

## Testing

```bash
# Upload a file
curl -X POST \
  -F "file=@test.pdf" \
  http://localhost:3000/api/medical-records/{id}/files/upload

# Download a file
curl -O http://localhost:3000/api/medical-records/{recordId}/files/file/{fileId}

# Delete a file
curl -X DELETE \
  http://localhost:3000/api/medical-records/{recordId}/files/file/{fileId}
```
