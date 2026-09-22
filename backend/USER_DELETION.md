# User Deletion System

This document describes the comprehensive user deletion system implemented in the Excel Analytics Platform.

## Overview

When a user is deleted (either by admin or self-deletion), the system performs a complete cleanup of all user-related data including:

1. **User Account**: Removed from the database
2. **Profile Picture**: Deleted from storage
3. **Uploaded Files**: All files deleted from storage
4. **File Metadata**: All FileMeta records deleted
5. **Data Rows**: All DataRow records associated with user's files deleted
6. **Orphaned Files**: Cleanup of any remaining orphaned files

## API Endpoints

### Admin User Deletion

#### Get User Deletion Statistics
```
GET /api/admin/users/:id/stats
```
Returns statistics about what will be deleted when the user is removed.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "hasProfilePic": true
  },
  "files": 5,
  "dataRows": 1000,
  "storageUsed": 2048576,
  "joinDate": "2024-01-01T00:00:00.000Z"
}
```

#### Delete User (Admin)
```
DELETE /api/admin/users/:id
```
Deletes a user and all associated data. Requires admin privileges.

**Response:**
```json
{
  "msg": "User and all associated data deleted successfully",
  "details": {
    "success": true,
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user"
    },
    "filesDeleted": 5,
    "dataRowsDeleted": 1000,
    "storageFreed": 2048576,
    "fileMetadataDeleted": 5,
    "profilePicDeleted": true,
    "errors": [],
    "warnings": []
  }
}
```

### User Self-Deletion

#### Delete Own Account
```
DELETE /api/auth/delete-account
```
Allows users to delete their own account. Requires password verification.

**Request Body:**
```json
{
  "password": "user_password"
}
```

**Response:**
```json
{
  "msg": "Account deleted successfully",
  "details": {
    "success": true,
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user"
    },
    "filesDeleted": 3,
    "dataRowsDeleted": 500,
    "storageFreed": 1024000,
    "fileMetadataDeleted": 3,
    "profilePicDeleted": false,
    "errors": [],
    "warnings": []
  }
}
```

## Utility Functions

### `deleteUserCompletely(userId, reason)`

Comprehensive user deletion utility that handles all aspects of user data cleanup.

**Parameters:**
- `userId` (string): The user ID to delete
- `reason` (string): Reason for deletion (for logging)

**Returns:**
```json
{
  "success": boolean,
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  },
  "filesDeleted": number,
  "dataRowsDeleted": number,
  "storageFreed": number,
  "fileMetadataDeleted": number,
  "profilePicDeleted": boolean,
  "errors": [string],
  "warnings": [string]
}
```

### `getUserDeletionStats(userId)`

Gets statistics about what will be deleted for a user.

**Parameters:**
- `userId` (string): The user ID to analyze

**Returns:**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "hasProfilePic": boolean
  },
  "files": number,
  "dataRows": number,
  "storageUsed": number,
  "joinDate": "2024-01-01T00:00:00.000Z"
}
```

## Deletion Process

1. **User Verification**: Check if user exists and verify permissions
2. **Profile Picture Cleanup**: Delete profile picture file if exists
3. **File Analysis**: Find all files uploaded by the user
4. **Data Row Cleanup**: Delete all DataRow records associated with user's files
5. **File Storage Cleanup**: Delete actual files from uploads directory
6. **Metadata Cleanup**: Delete all FileMeta records for the user
7. **Direct Data Cleanup**: Delete any DataRow records directly associated with user
8. **User Account Deletion**: Remove user from database
9. **Orphaned File Cleanup**: Run cleanup to remove any remaining orphaned files

## Error Handling

The system includes comprehensive error handling:

- **Individual File Errors**: If one file fails to delete, the process continues
- **Storage Errors**: File deletion errors are logged but don't stop the process
- **Database Errors**: Database operation failures are properly handled
- **Cleanup Errors**: Orphaned file cleanup failures are logged as warnings

## Logging

All deletion operations are logged with:
- User identification (name, email)
- Number of files and data rows processed
- Storage space freed
- Any errors or warnings encountered
- Reason for deletion (admin vs self-deletion)

## Security Considerations

1. **Admin Only**: Admin user deletion requires admin privileges
2. **Password Verification**: Self-deletion requires password confirmation
3. **User Isolation**: Users can only delete their own data
4. **Audit Trail**: All deletions are logged for audit purposes

## File Structure

```
backend/
├── utils/
│   └── userDeletion.js          # Main deletion utility
├── routes/
│   ├── admin.js                 # Admin deletion endpoints
│   ├── auth.js                  # User self-deletion endpoint
│   └── files.js                 # File cleanup utilities
└── models/
    ├── User.js                  # User model
    ├── FileMeta.js              # File metadata model
    └── DataRow.js               # Data row model
```

## Usage Examples

### Admin deleting a user
```javascript
const { deleteUserCompletely } = require('./utils/userDeletion');

const results = await deleteUserCompletely(userId, "Admin deletion");
if (results.success) {
  console.log(`Deleted ${results.filesDeleted} files and ${results.dataRowsDeleted} data rows`);
}
```

### Getting user statistics before deletion
```javascript
const { getUserDeletionStats } = require('./utils/userDeletion');

const stats = await getUserDeletionStats(userId);
console.log(`User has ${stats.files} files using ${stats.storageUsed} bytes`);
```

## Testing

To test the deletion system:

1. Create a test user with some uploaded files
2. Use the stats endpoint to verify what will be deleted
3. Perform the deletion
4. Verify that all data has been removed
5. Check that orphaned files are cleaned up

## Maintenance

The system automatically:
- Cleans up orphaned files after user deletion
- Logs all deletion operations
- Handles partial failures gracefully
- Provides detailed feedback on deletion results 