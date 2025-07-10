import UserModel, { IUser } from '@/models/User';
import { ValidationError } from '@/lib/errors/ValidationError';
import { Logger } from '@/lib/logging/logger';

const logger = new Logger('UserService');

interface UserData {
  id: string;
  roles: string[];
  permissions: string[];
  email?: string;
  name?: string;
}

/**
 * Retrieves user data from database including roles and permissions
 * @param userId - The ID of the user to retrieve
 * @returns User data or null if not found
 */
export async function getUserFromDatabase(userId: string): Promise<UserData | null> {
  try {
    const user = await UserModel.findById(userId).select('roles permissions email name _id').lean() as IUser | null;
    
    if (!user) {
      logger.debug('User not found in database', { userId });
      return null;
    }

    return {
      id: user._id.toString(),
      roles: user.roles || [],
      permissions: user.permissions || [],
      email: user.email,
      name: user.name
    };
  } catch (error) {
    logger.error('Error fetching user from database', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new ValidationError('Failed to fetch user data');
  }
}
