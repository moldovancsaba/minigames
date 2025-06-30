import { MongoClient } from 'mongodb';
import { initializeCollections } from '../models';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = new URL(uri).pathname.substr(1) || 'mosaic-cluster';

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

// Main connection function that maintains the cached connection
export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(`Attempting MongoDB connection in ${process.env.NODE_ENV} mode...`);
    const client = new MongoClient(uri);
    
    cached.promise = client.connect()
      .then(async (client) => {
        console.log(`MongoDB connected successfully in ${process.env.NODE_ENV} mode`);
        const db = client.db(dbName);
        await initializeCollections(db);
        return {
          client,
          db
        };
      })
      .catch((error) => {
        console.error(`MongoDB connection failed in ${process.env.NODE_ENV} mode:`, error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// For backwards compatibility and direct client access if needed
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Initialize the connection
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Attempting MongoDB connection in development mode...');
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect().then(client => {
      console.log('MongoDB connected successfully in development mode');
      return client;
    }).catch(error => {
      console.error('MongoDB connection failed in development mode:', error);
      throw error;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Attempting MongoDB connection in production mode...');
  client = new MongoClient(uri);
  clientPromise = client.connect().then(client => {
    console.log('MongoDB connected successfully in production mode');
    return client;
  }).catch(error => {
    console.error('MongoDB connection failed in production mode:', error);
    throw error;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
