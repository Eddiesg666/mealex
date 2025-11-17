# Mealex REST API

RESTful API for the Mealex social networking app, built with Node.js, Express, and Firebase Cloud Functions.

## Features

- **RESTful Architecture**: Clean HTTP endpoints following REST principles
- **Authentication**: JWT token verification via Firebase Auth
- **Authorization**: User-specific access control
- **CRUD Operations**: Complete invitation and profile management
- **Error Handling**: Comprehensive error responses
- **CORS Enabled**: Cross-origin requests supported

## API Endpoints

### Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invitations/incoming/:userId` | Get incoming invitations |
| GET | `/api/invitations/outgoing/:userId` | Get outgoing invitations |
| POST | `/api/invitations` | Send new invitation |
| PATCH | `/api/invitations/:userId/:invitationId` | Update invitation status |
| DELETE | `/api/invitations/:userId/:invitationId` | Delete invitation |

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | Get all profiles |
| GET | `/api/profiles/:userId` | Get specific profile |
| PUT | `/api/profiles/:userId` | Update profile |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## Setup

1. **Install dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Run locally with emulator**:
   ```bash
   npm run serve
   ```

3. **Deploy to Firebase**:
   ```bash
   npm run deploy
   ```

## Authentication

All endpoints (except `/api/health`) require authentication via Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

## Example Requests

### Send Invitation
```bash
curl -X POST https://your-project.cloudfunctions.net/api/invitations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "user123",
    "body": "Would you like to grab lunch?"
  }'
```

### Get Incoming Invitations
```bash
curl https://your-project.cloudfunctions.net/api/invitations/incoming/user123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Invitation Status
```bash
curl -X PATCH https://your-project.cloudfunctions.net/api/invitations/user123/inv456 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

## Response Format

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "error": "Error message"
}
```

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Platform**: Firebase Cloud Functions
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
