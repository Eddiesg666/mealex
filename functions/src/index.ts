import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Create Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Welcome endpoint at root
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Mealex REST API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      profiles: 'GET /api/profiles (auth required)',
      invitations: 'GET /api/invitations/incoming/:userId (auth required)'
    },
    documentation: 'See API_TESTING_GUIDE.md for complete documentation'
  });
});

// Middleware to verify authentication
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.body.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

// ============== INVITATION ENDPOINTS ==============

/**
 * GET /api/invitations/incoming/:userId
 * Get all incoming invitations for a user
 */
app.get('/api/invitations/incoming/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own invitations
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot access other users invitations' });
      return;
    }

    const snapshot = await db.ref(`/invitations/${userId}/messages`).once('value');
    const invitations = snapshot.val() || {};
    
    res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching incoming invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/invitations/outgoing/:userId
 * Get all outgoing invitations sent by a user
 */
app.get('/api/invitations/outgoing/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const snapshot = await db.ref('/invitations').once('value');
    const allInvitations = snapshot.val() || {};
    
    // Filter for invitations sent by this user
    const outgoing: any = {};
    Object.keys(allInvitations).forEach(receiverId => {
      const messages = allInvitations[receiverId].messages || {};
      Object.keys(messages).forEach(msgId => {
        if (messages[msgId].sender === userId) {
          if (!outgoing[receiverId]) outgoing[receiverId] = {};
          outgoing[receiverId][msgId] = messages[msgId];
        }
      });
    });
    
    res.status(200).json({
      success: true,
      data: outgoing
    });
  } catch (error) {
    console.error('Error fetching outgoing invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/invitations
 * Send a new invitation
 */
app.post('/api/invitations', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver, body } = req.body;
    const sender = req.body.uid;

    if (!receiver || !body) {
      res.status(400).json({ error: 'Missing required fields: receiver, body' });
      return;
    }

    const invitation = {
      sender,
      receiver,
      body: body.trim(),
      resolved: false,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    const invitationRef = await db.ref(`/invitations/${receiver}/messages`).push(invitation);
    
    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitationRef.key,
      data: invitation
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/invitations/:userId/:invitationId
 * Update invitation status (accept/reject)
 */
app.patch('/api/invitations/:userId/:invitationId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, invitationId } = req.params;
    const { status } = req.body;

    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected"' });
      return;
    }

    await db.ref(`/invitations/${userId}/messages/${invitationId}/status`).set(status);
    
    res.status(200).json({
      success: true,
      message: `Invitation ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/invitations/:userId/:invitationId
 * Delete an invitation
 */
app.delete('/api/invitations/:userId/:invitationId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, invitationId } = req.params;

    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await db.ref(`/invitations/${userId}/messages/${invitationId}`).remove();
    
    res.status(200).json({
      success: true,
      message: 'Invitation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============== PROFILE ENDPOINTS ==============

/**
 * GET /api/profiles
 * Get all user profiles
 */
app.get('/api/profiles', authenticate, async (req: Request, res: Response) => {
  try {
    const snapshot = await db.ref('/profiles').once('value');
    const profiles = snapshot.val() || {};
    
    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profiles/:userId
 * Get a specific user profile
 */
app.get('/api/profiles/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.ref(`/profiles/${userId}`).once('value');
    const profile = snapshot.val();
    
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profiles/:userId
 * Update user profile
 */
app.put('/api/profiles/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot update other users profiles' });
      return;
    }

    const profileData = req.body;
    delete profileData.uid; // Remove auth uid from profile data

    await db.ref(`/profiles/${userId}`).update(profileData);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.https.onRequest(app);
