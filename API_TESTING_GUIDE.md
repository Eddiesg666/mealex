# Mealex REST API Testing Guide

The REST API is successfully deployed at:
```
https://us-central1-mealex1.cloudfunctions.net/api
```

## Method 1: Test Health Endpoint (No Authentication)

The easiest way to verify the API works:

```bash
curl https://us-central1-mealex1.cloudfunctions.net/api/api/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-11-17T..."}
```

## Method 2: Test Through Your Deployed Mealex App

This is the BEST way to test authenticated endpoints:

### Step 1: Open Your Deployed Mealex App
```bash
# Deploy your app if haven't already
npm run build
firebase deploy

# Or run locally
npm run dev
```

### Step 2: Login to the App
- Go to the Mealex app (deployed or localhost)
- Login with your @u.northwestern.edu Google account
- Should see your profile

### Step 3: Open Browser Console
- Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Click the "Console" tab

### Step 4: Get Your Auth Token
Paste this code in the console and press Enter:
```javascript
// Get your Firebase auth token
const auth = (await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js')).getAuth();
const token = await auth.currentUser.getIdToken();
console.log('Your token:', token);
```

Copy the long token string that appears.

### Step 5: Test API Endpoints

Now in the console, paste these commands (replace YOUR_TOKEN with your actual token):

**Test Get All Profiles:**
```javascript
const response = await fetch('https://us-central1-mealex1.cloudfunctions.net/api/api/profiles', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
console.log(await response.json());
```

**Test Get Your Profile:**
```javascript
const userId = (await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js')).getAuth().currentUser.uid;
const response = await fetch(`https://us-central1-mealex1.cloudfunctions.net/api/api/profiles/${userId}`, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
console.log(await response.json());
```

**Test Get Incoming Invitations:**
```javascript
const userId = (await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js')).getAuth().currentUser.uid;
const response = await fetch(`https://us-central1-mealex1.cloudfunctions.net/api/api/invitations/incoming/${userId}`, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
console.log(await response.json());
```

## Method 3: Use Postman or Thunder Client

### Postman (Desktop App)
1. Download Postman: https://www.postman.com/downloads/
2. Create a new request
3. Set method to `GET`
4. Enter URL: `https://us-central1-mealex1.cloudfunctions.net/api/api/profiles`
5. Go to "Headers" tab
6. Add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`
7. Click "Send"

### Thunder Client (VS Code Extension)
1. Install "Thunder Client" extension in VS Code
2. Click the Thunder Client icon in the sidebar
3. Click "New Request"
4. Follow same steps as Postman above

## Method 4: Check Firebase Console

View real-time logs and metrics:

```bash
# View function logs
firebase functions:log

# Or open Firebase Console
open https://console.firebase.google.com/project/mealex1/functions
```

In the Firebase Console you can see:
- Number of invocations (how many times API was called)
- Execution time (how fast your API responds)
- Error rates
- Real-time logs of every API call

## What Success Looks Like

When your API is working correctly, you should see:

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T07:56:22.169Z"
}
```

**Get Profiles Response:**
```json
{
  "success": true,
  "data": {
    "user123": {
      "name": "John Doe",
      "major": "Computer Science",
      "year": "Junior",
      "bio": "...",
      "tags": ["..."]
    }
  }
}
```

**Get Invitations Response:**
```json
{
  "success": true,
  "invitationCount": 3,
  "data": {
    "msg123": {
      "sender": "user456",
      "receiver": "user123",
      "body": "Want to grab lunch?",
      "status": "pending",
      "timestamp": "11/17/2025, 3:45:00 PM"
    }
  }
}
```

## Summary

- Build backend services with Node.js + Express
- Deploy to Google Cloud Platform (Firebase Functions)
- Implement JWT authentication
- Design RESTful APIs with proper HTTP methods
- Secure endpoints with authorization checks
- Handle errors gracefully
- Work with cloud databases

## Quick Verification Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Firebase Console shows the function is active
- [ ] Can login to your Mealex app
- [ ] Can get auth token from browser console
- [ ] Authenticated endpoints return data (not 401 errors)
- [ ] Firebase logs show API requests

