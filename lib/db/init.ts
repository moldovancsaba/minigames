import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      if (cached.conn.readyState === 1) { // Connected
        console.log('Using cached database connection');
        return cached.conn;
      }
      // If not connected, clear the cache
      console.log('Cached connection is stale, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log(`Connecting to MongoDB in ${process.env.NODE_ENV} mode...`);
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
}

export default dbConnect;
