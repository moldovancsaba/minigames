import mongoose from 'mongoose';

import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  roles: string[];
  permissions: string[];
  name?: string;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  roles: { 
    type: [String],
    default: []
  },
  permissions: {
    type: [String],
    default: []
  },
  name: {
    type: String,
    trim: true
  },
  lastLoginAt: { 
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure email is unique
userSchema.index({ email: 1 }, { unique: true, background: true });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
