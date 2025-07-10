import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export function getMongoClient() {
  if (!cachedClient) {
    throw new Error('Call connectToDatabase() before using getMongoClient()');
  }
  return cachedClient;
}

export function getMongoDb() {
  if (!cachedDb) {
    throw new Error('Call connectToDatabase() before using getMongoDb()');
  }
  return cachedDb;
}
