import mongoose from 'mongoose';
import { Logger } from '@/lib/logging/logger';

const logger = new Logger('MongoDB');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mosaic';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      logger.info('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    logger.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export function getMongoClient() {
  if (!cached.conn) {
    throw new Error('Call connectToDatabase() before using getMongoClient()');
  }
  return cached.conn.connection.getClient();
}

export default mongoose;
