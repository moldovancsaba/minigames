import User, { IUser } from '@/models/User';
import { connectToDatabase } from '@/lib/database';

/**
 * UserService class provides centralized user management operations
 * - Handles user creation and lookup
 * - Manages admin role assignment based on email
 * - Ensures consistent email format and timestamp handling
 */
export class UserService {
  /**
   * Finds an existing user by email or creates a new one if not found
   * Updates the lastLoginAt timestamp on each lookup
   * Automatically assigns admin role for configured admin email
   */
  static async findOrCreateUser(email: string): Promise<IUser> {
    await connectToDatabase();
    
    const isAdminEmail = email.toLowerCase() === 'admin@example.com'; // Configure admin email
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          role: isAdminEmail ? 'admin' : 'user',
          lastLoginAt: new Date().toISOString() // Using ISO 8601 format with milliseconds
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    return user;
  }

  /**
   * Finds a user by their email address
   * Ensures consistent email format by converting to lowercase
   */
  static async getAllUsers(): Promise<IUser[]> {
    await connectToDatabase();
    return User.find().sort({ createdAt: -1 });
  }

  static async updateUserRole(email: string, role: 'admin' | 'user'): Promise<IUser | null> {
    await connectToDatabase();
    return User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role } },
      { new: true }
    );
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findOne({ email: email.toLowerCase() });
  }
}
