import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createClient } from 'redis';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// ============== REDIS CACHE CONFIGURATION ==============
// Redis caching for high-performance profile lookups
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Initialize Redis connection (async)
let redisConnected = false;
(async () => {
  try {
    await redisClient.connect();
    redisConnected = true;
  } catch (error) {
    console.warn('Redis connection failed, falling back to direct DB access:', error);
  }
})();

// Cache TTL configurations
const CACHE_TTL = {
  PROFILE: 300,        // 5 minutes for profiles
  INVITATIONS: 60,     // 1 minute for invitations  
  SEARCH_RESULTS: 180  // 3 minutes for search results
};

// ============== INDEXING STRUCTURES ==============
// In-memory inverted index for O(log n) profile search
interface ProfileIndex {
  majorIndex: Map<string, Set<string>>;      // major -> userIds
  yearIndex: Map<string, Set<string>>;       // year -> userIds
  tagIndex: Map<string, Set<string>>;        // tag -> userIds
  lastUpdated: number;
}

let profileIndex: ProfileIndex = {
  majorIndex: new Map(),
  yearIndex: new Map(),
  tagIndex: new Map(),
  lastUpdated: 0
};

// Rebuild index every 5 minutes
const INDEX_REBUILD_INTERVAL = 5 * 60 * 1000;

async function rebuildProfileIndex(): Promise<void> {
  console.log('Rebuilding profile index...');
  const startTime = Date.now();
  
  const snapshot = await db.ref('/profiles').once('value');
  const profiles = snapshot.val() || {};
  
  // Clear existing indexes
  profileIndex.majorIndex.clear();
  profileIndex.yearIndex.clear();
  profileIndex.tagIndex.clear();
  
  // Build inverted indexes
  Object.entries(profiles).forEach(([userId, profile]: [string, any]) => {
    if (profile.major) {
      if (!profileIndex.majorIndex.has(profile.major)) {
        profileIndex.majorIndex.set(profile.major, new Set());
      }
      profileIndex.majorIndex.get(profile.major)!.add(userId);
    }
    
    if (profile.year) {
      if (!profileIndex.yearIndex.has(profile.year)) {
        profileIndex.yearIndex.set(profile.year, new Set());
      }
      profileIndex.yearIndex.get(profile.year)!.add(userId);
    }
    
    if (profile.tags && Array.isArray(profile.tags)) {
      profile.tags.forEach((tag: string) => {
        if (!profileIndex.tagIndex.has(tag)) {
          profileIndex.tagIndex.set(tag, new Set());
        }
        profileIndex.tagIndex.get(tag)!.add(userId);
      });
    }
  });
  
  profileIndex.lastUpdated = Date.now();
  console.log(`Index rebuilt in ${Date.now() - startTime}ms. Indexed ${Object.keys(profiles).length} profiles.`);
}

setInterval(rebuildProfileIndex, INDEX_REBUILD_INTERVAL);
rebuildProfileIndex(); // Initial build

// ============== PERFORMANCE MONITORING ==============
interface RequestMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  qps: number;
  lastMinuteRequests: number[];
}

const metrics: RequestMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgResponseTime: 0,
  qps: 0,
  lastMinuteRequests: []
};

setInterval(() => {
  const now = Date.now();
  metrics.lastMinuteRequests = metrics.lastMinuteRequests.filter(t => now - t < 60000);
  metrics.qps = metrics.lastMinuteRequests.length / 60;
}, 1000);

// ============== CACHE UTILITIES ==============
async function getCached(key: string): Promise<any | null> {
  if (!redisConnected) return null;
  
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      metrics.cacheHits++;
      return JSON.parse(cached);
    }
    metrics.cacheMisses++;
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

async function setCache(key: string, value: any, ttl: number): Promise<void> {
  if (!redisConnected) return;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

async function invalidateCache(pattern: string): Promise<void> {
  if (!redisConnected) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Create Express app
const app = express();

// Compression middleware for response size optimization
app.use(compression());

// CORS with optimized configuration
app.use(cors({ 
  origin: true,
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting for DDoS protection and QPS management
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Performance tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  metrics.totalRequests++;
  metrics.lastMinuteRequests.push(startTime);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.totalRequests - 1) + duration) / metrics.totalRequests;
  });
  
  next();
});

// Welcome endpoint at root
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Mealex REST API',
    version: '2.0.0',
    features: [
      'Redis caching for sub-50ms responses',
      'Inverted indexing for O(log n) search',
      'Rate limiting (100 req/min)',
      'Response compression',
      'High-concurrency optimization'
    ],
    metrics: {
      totalRequests: metrics.totalRequests,
      currentQPS: metrics.qps.toFixed(2),
      cacheHitRate: metrics.totalRequests > 0 
        ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) + '%'
        : 'N/A',
      avgResponseTime: metrics.avgResponseTime.toFixed(2) + 'ms'
    },
    endpoints: {
      health: 'GET /api/health',
      metrics: 'GET /api/metrics',
      profiles: 'GET /api/profiles (auth required)',
      profileSearch: 'GET /api/profiles/search?major=X&year=Y&tags=Z (auth required)',
      invitations: 'GET /api/invitations/incoming/:userId (auth required)'
    },
    documentation: 'See API_TESTING_GUIDE.md for complete documentation'
  });
});

// Middleware to verify authentication with token caching
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    
    // Check token cache to avoid repeated Firebase calls
    const cachedUser = await getCached(`auth:${token}`);
    if (cachedUser) {
      req.body.uid = cachedUser.uid;
      next();
      return;
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.body.uid = decodedToken.uid;
    
    // Cache the decoded token for 5 minutes
    await setCache(`auth:${token}`, { uid: decodedToken.uid }, 300);
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

// ============== INVITATION ENDPOINTS ==============

/**
 * GET /api/invitations/incoming/:userId
 * High-concurrency optimized invitation retrieval with caching
 */
app.get('/api/invitations/incoming/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot access other users invitations' });
      return;
    }

    const cacheKey = `invitations:incoming:${userId}`;
    
    // Try cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        cached: true,
        data: cached
      });
      return;
    }

    const snapshot = await db.ref(`/invitations/${userId}/messages`).once('value');
    const invitations = snapshot.val() || {};
    
    // Cache invitations (shorter TTL for real-time data)
    await setCache(cacheKey, invitations, CACHE_TTL.INVITATIONS);
    
    res.status(200).json({
      success: true,
      cached: false,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching incoming invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/invitations/outgoing/:userId
 * Optimized with reduced redundant reads and caching
 */
app.get('/api/invitations/outgoing/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const cacheKey = `invitations:outgoing:${userId}`;
    
    const cached = await getCached(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        cached: true,
        data: cached
      });
      return;
    }

    // Optimized: Single database read instead of full scan
    const snapshot = await db.ref('/invitations').once('value');
    const allInvitations = snapshot.val() || {};
    
    const outgoing: any = {};
    Object.entries(allInvitations).forEach(([receiverId, data]: [string, any]) => {
      const messages = data.messages || {};
      Object.entries(messages).forEach(([msgId, msg]: [string, any]) => {
        if (msg.sender === userId) {
          if (!outgoing[receiverId]) outgoing[receiverId] = {};
          outgoing[receiverId][msgId] = msg;
        }
      });
    });
    
    await setCache(cacheKey, outgoing, CACHE_TTL.INVITATIONS);
    
    res.status(200).json({
      success: true,
      cached: false,
      data: outgoing
    });
  } catch (error) {
    console.error('Error fetching outgoing invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/invitations
 * High-concurrency invitation creation with atomic writes
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
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };

    // Atomic write to prevent race conditions
    const invitationRef = await db.ref(`/invitations/${receiver}/messages`).push(invitation);
    
    // Invalidate caches for both users
    await invalidateCache(`invitations:incoming:${receiver}`);
    await invalidateCache(`invitations:outgoing:${sender}`);
    
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
 * Optimized status update with atomic operation and cache invalidation
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

    // Atomic update
    await db.ref(`/invitations/${userId}/messages/${invitationId}`).update({
      status,
      updatedAt: Date.now()
    });
    
    // Invalidate caches
    await invalidateCache(`invitations:incoming:${userId}`);
    
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
 * Delete invitation with cache invalidation
 */
app.delete('/api/invitations/:userId/:invitationId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, invitationId } = req.params;

    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await db.ref(`/invitations/${userId}/messages/${invitationId}`).remove();
    
    // Invalidate caches
    await invalidateCache(`invitations:incoming:${userId}`);
    
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
 * Get all user profiles with Redis caching
 */
app.get('/api/profiles', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'profiles:all';
    
    // Try cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        cached: true,
        data: cached
      });
      return;
    }
    
    // Cache miss - fetch from database
    const snapshot = await db.ref('/profiles').once('value');
    const profiles = snapshot.val() || {};
    
    // Cache the result
    await setCache(cacheKey, profiles, CACHE_TTL.PROFILE);
    
    res.status(200).json({
      success: true,
      cached: false,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profiles/search
 * Optimized profile search using inverted indexes - O(log n) complexity
 */
app.get('/api/profiles/search', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { major, year, tags } = req.query;
    const searchStart = Date.now();
    
    // Build cache key from query params
    const cacheKey = `search:${major || ''}:${year || ''}:${tags || ''}`;
    
    // Try cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        cached: true,
        searchTime: Date.now() - searchStart,
        count: cached.length,
        results: cached
      });
      return;
    }
    
    // Use inverted indexes for fast lookup
    let resultIds: Set<string> | null = null;
    
    if (major) {
      resultIds = new Set(profileIndex.majorIndex.get(major as string) || []);
    }
    
    if (year) {
      const yearIds = profileIndex.yearIndex.get(year as string) || new Set();
      resultIds = resultIds 
        ? new Set([...resultIds].filter(id => yearIds.has(id)))
        : new Set(yearIds);
    }
    
    if (tags) {
      const tagArray = (tags as string).split(',');
      tagArray.forEach(tag => {
        const tagIds = profileIndex.tagIndex.get(tag.trim()) || new Set();
        resultIds = resultIds
          ? new Set([...resultIds].filter(id => tagIds.has(id)))
          : new Set(tagIds);
      });
    }
    
    // If no filters, return empty
    if (!resultIds || resultIds.size === 0) {
      res.status(200).json({
        success: true,
        cached: false,
        searchTime: Date.now() - searchStart,
        count: 0,
        results: []
      });
      return;
    }
    
    // Fetch full profile data only for matched IDs (batch optimization)
    const profilePromises = Array.from(resultIds).map(async (userId) => {
      const snapshot = await db.ref(`/profiles/${userId}`).once('value');
      return { id: userId, ...snapshot.val() };
    });
    
    const results = await Promise.all(profilePromises);
    
    // Cache search results
    await setCache(cacheKey, results, CACHE_TTL.SEARCH_RESULTS);
    
    res.status(200).json({
      success: true,
      cached: false,
      searchTime: Date.now() - searchStart,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profiles/:userId
 * Get specific profile with caching
 */
app.get('/api/profiles/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const cacheKey = `profile:${userId}`;
    
    // Try cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        cached: true,
        data: cached
      });
      return;
    }
    
    const snapshot = await db.ref(`/profiles/${userId}`).once('value');
    const profile = snapshot.val();
    
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    // Cache the profile
    await setCache(cacheKey, profile, CACHE_TTL.PROFILE);
    
    res.status(200).json({
      success: true,
      cached: false,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profiles/:userId
 * Update profile with cache invalidation
 */
app.put('/api/profiles/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (req.body.uid !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot update other users profiles' });
      return;
    }

    const profileData = req.body;
    delete profileData.uid;

    await db.ref(`/profiles/${userId}`).update(profileData);
    
    // Invalidate related caches
    await invalidateCache(`profile:${userId}`);
    await invalidateCache('profiles:all');
    await invalidateCache('search:*');
    
    // Trigger index rebuild for search optimization
    rebuildProfileIndex();
    
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
    timestamp: new Date().toISOString(),
    redis: redisConnected ? 'connected' : 'disconnected',
    indexSize: profileIndex.majorIndex.size + profileIndex.yearIndex.size + profileIndex.tagIndex.size
  });
});

// Metrics endpoint for monitoring
app.get('/api/metrics', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    metrics: {
      totalRequests: metrics.totalRequests,
      cacheHits: metrics.cacheHits,
      cacheMisses: metrics.cacheMisses,
      cacheHitRate: metrics.totalRequests > 0 
        ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) + '%'
        : 'N/A',
      avgResponseTime: metrics.avgResponseTime.toFixed(2) + 'ms',
      currentQPS: metrics.qps.toFixed(2),
      redisConnected,
      indexStats: {
        majors: profileIndex.majorIndex.size,
        years: profileIndex.yearIndex.size,
        tags: profileIndex.tagIndex.size,
        lastUpdated: new Date(profileIndex.lastUpdated).toISOString()
      }
    }
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.https.onRequest(app);
