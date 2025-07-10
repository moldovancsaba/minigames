import { MongoClient, Db } from 'mongodb';

// MongoDB connection interface
export interface MongoConnection {
  client: MongoClient;
  db: Db;
}

// Organization interface for the schema and API operations
export interface Organization {
  _id?: string;  // Optional for new organizations
  name: string;
  description?: string;
  maxMembers?: number;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}
