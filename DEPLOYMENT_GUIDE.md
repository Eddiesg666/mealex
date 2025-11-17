# Deployment Guide: Adding REST API to Mealex

## What We Added

A complete RESTful API layer using:
- **Node.js** + **Express.js** for the web framework
- **Firebase Cloud Functions** for serverless deployment
- **TypeScript** for type safety
- JWT authentication with Firebase Auth

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Test Locally (Optional but Recommended)

```bash
# Start Firebase emulator
npm run serve
```

The API will be available at: `http://localhost:5001/YOUR-PROJECT-ID/us-central1/api`

Test with:
```bash
curl http://localhost:5001/YOUR-PROJECT-ID/us-central1/api/health
```

### 3. Deploy to Firebase

```bash
# From the functions directory
npm run deploy

# OR from the project root
firebase deploy --only functions
```

### 4. Get Your API URL

After deployment, you'll see output like:
```
✔  functions[api(us-central1)] Deployed successfully
   https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api
```

### 5. Update Frontend to Use REST API (Optional)

You can now optionally update the React app to use REST endpoints instead of direct database calls.

Example in `firebase.ts`:
```typescript
// Old way (direct database)
const [data] = useDataQuery('/invitations/...');

// New way (REST API)
const response = await fetch('https://YOUR-API-URL/api/invitations/incoming/userId', {
  headers: {
    'Authorization': `Bearer ${await user.getIdToken()}`
  }
});
const data = await response.json();
```

## What This Gives You

**RESTful API endpoints** - Clean HTTP interface  
**Node.js backend** - Serverless functions  
**Express.js routing** - Industry-standard web framework  
**Authentication & Authorization** - Secure access control  
**Scalable architecture** - Auto-scales with traffic  
**Resume-worthy** - Real REST API experience  


## Troubleshooting

**Error: "Firebase CLI not found"**
```bash
npm install -g firebase-tools
firebase login
```

**Error: "Functions deployment failed"**
- Check that Node.js 22 is installed: `node --version`
- Ensure you're in the correct Firebase project: `firebase use --add`
- Check functions quota in Firebase Console

**Error: CORS issues**
- The API already has CORS enabled with `cors({ origin: true })`
- For production, restrict origins in the `cors()` config

## Next Steps

1. Deploy the functions: `cd functions && npm run deploy`
2. Test endpoints with curl or Postman
3. (Optional) Migrate frontend to use REST API
4. Update resume with REST API experience!
