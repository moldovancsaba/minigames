import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import mongoose from 'mongoose';
import { initializeCollections } from '../models';

// Environment validation
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'mosaic';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

// Type definitions for better type safety
interface ConnectionPool {
  /** Native MongoDB client connection */
  mongoClient: MongoClient;
  /** MongoDB database instance */
  db: Db;
  /** Mongoose connection instance */
  mongoose: typeof mongoose;
  /** Last connection check timestamp */
  lastCheck: Date;
  /** Current connection status */
  status: ConnectionStatus;
}

interface ConnectionCache {
  pool: ConnectionPool | null;
  promise: Promise<ConnectionPool> | null;
}

enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Connecting = 'connecting'
}

interface ConnectionOptions extends MongoClientOptions {
  /** Maximum connection pool size */
  maxPoolSize?: number;
  /** Minimum connection pool size */
  minPoolSize?: number;
  /** Connection timeout in milliseconds */
  connectTimeoutMS?: number;
  /** Whether to use Mongoose alongside native MongoDB driver */
  useMongoose?: boolean;
  /** Mongoose-specific option for buffering commands */
  mongooseOptions?: {
    bufferCommands?: boolean;
  };
}

// Default connection options optimized for performance and reliability
const DEFAULT_OPTIONS: ConnectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  connectTimeoutMS: 10000,
  useMongoose: true,
  mongooseOptions: {
    bufferCommands: false
  },
  // Auto-reconnect and retry settings
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
};

/**
 * Global connection cache to prevent connection pool explosion
 * during hot reloads in development
 */
let connectionCache: ConnectionCache = (global as any).mongoPool || {
  pool: null,
  promise: null,
};

// Initialize global cache if not exists
if (!(global as any).mongoPool) {
  (global as any).mongoPool = connectionCache;
}

/**
 * Monitors database connection health
 * @param pool The connection pool to monitor
 */
async function monitorConnection(pool: ConnectionPool): Promise<void> {
  try {
    await pool.db.command({ ping: 1 });
    pool.status = ConnectionStatus.Connected;
    pool.lastCheck = new Date();
    console.log(`[Database] Connection healthy at ${pool.lastCheck.toISOString()}`);
  } catch (error) {
    pool.status = ConnectionStatus.Error;
    console.error('[Database] Connection health check failed:', error);
    throw error;
  }
}

/**
 * Creates a new database connection pool or returns an existing one
 * @param options Connection configuration options
 * @returns A Promise resolving to the connection pool
 */
export async function connectToDatabase(
  options: ConnectionOptions = DEFAULT_OPTIONS
): Promise<ConnectionPool> {
  // Return existing connection if available
  if (connectionCache.pool) {
    try {
      await monitorConnection(connectionCache.pool);
      return connectionCache.pool;
    } catch (error) {
      // Connection is stale, clear cache and reconnect
      console.warn('[Database] Stale connection detected, reconnecting...');
      connectionCache.pool = null;
      connectionCache.promise = null;
    }
  }

  // Create new connection if no existing promise
  if (!connectionCache.promise) {
    console.log('[Database] Initializing new connection pool...');

    connectionCache.promise = (async () => {
      try {
        // Initialize MongoDB native client
const client = new MongoClient(MONGODB_URI as string, options);
        await client.connect();
        const db = client.db(MONGODB_DB);
        
        // Initialize collections if needed
        await initializeCollections(db);

        // Initialize Mongoose if requested
        let mongooseInstance = mongoose;
        if (options.useMongoose) {
          await mongoose.connect(MONGODB_URI as string, {
            bufferCommands: options.mongooseOptions?.bufferCommands,
          });
        }

        const pool: ConnectionPool = {
          mongoClient: client,
          db,
          mongoose: mongooseInstance,
          lastCheck: new Date(),
          status: ConnectionStatus.Connected,
        };

        // Set up periodic health checks
        setInterval(() => {
          monitorConnection(pool).catch(console.error);
        }, options.heartbeatFrequencyMS || 10000);

        console.log('[Database] Connection pool successfully initialized');
        return pool;
      } catch (error) {
        console.error('[Database] Failed to initialize connection pool:', error);
        connectionCache.promise = null;
        throw error;
      }
    })();
  }

  try {
    connectionCache.pool = await connectionCache.promise;
    return connectionCache.pool;
  } catch (error) {
    connectionCache.promise = null;
    console.error('[Database] Connection attempt failed:', error);
    throw error;
  }
}

/**
 * Gracefully closes all database connections
 */
export async function closeConnections(): Promise<void> {
  if (!connectionCache.pool) return;

  try {
    await connectionCache.pool.mongoClient.close();
    if (connectionCache.pool.mongoose) {
      await connectionCache.pool.mongoose.disconnect();
    }
    connectionCache.pool.status = ConnectionStatus.Disconnected;
    connectionCache.pool = null;
    connectionCache.promise = null;
    console.log('[Database] All connections closed successfully');
  } catch (error) {
    console.error('[Database] Error closing connections:', error);
    throw error;
  }
}

export default connectToDatabase;
