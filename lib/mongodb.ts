import { MongoClient } from 'mongodb';
import { initializeCollections } from '../models';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mosaic';

// Types for the cached connection
interface MongoConnection {
  client: MongoClient;
  db: any; // Using any for now, could be typed more specifically if needed
}

interface CachedConnection {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
}

// Global cache for the MongoDB connection
let cached: CachedConnection = (global as any).mongo || { conn: null, promise: null };
if (!(global as any).mongo) {
  (global as any).mongo = cached;
}

// Main connection function that maintains the cached connection with improved error handling
export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached.conn) {
    // Check if existing connection is alive
    try {
      await cached.conn.client.db().command({ ping: 1 });
      return cached.conn;
    } catch (error) {
      console.log('Cached connection is stale, creating new connection...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,  // 5 seconds timeout for server selection
      connectTimeoutMS: 10000,         // 10 seconds timeout for initial connection
    });
    
    cached.promise = client.connect()
      .then(async (client) => {
        // Verify we can actually perform operations
        await client.db().command({ ping: 1 });
        const db = client.db(dbName);
        await initializeCollections(db);
        return {
          client,
          db
        };
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null; // Reset promise on error
        throw new Error('Database connection failed. Please check your connection settings.');
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    throw error;
  }
}

// For backwards compatibility and direct client access if needed
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Initialize the connection
// Always use production-style connection handling for better reliability
client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,  // 5 seconds timeout for server selection
  connectTimeoutMS: 10000,         // 10 seconds timeout for initial connection
});

clientPromise = client.connect()
  .then(async (client) => {
    // Verify connection with ping
    await client.db().command({ ping: 1 });
    console.log('MongoDB connected successfully');
    return client;
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    throw new Error('Database connection failed. Please check your connection settings.');
  });

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
