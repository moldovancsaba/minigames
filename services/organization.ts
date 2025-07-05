import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { Organization } from '../models/organization';

export class OrganizationService {
  private static async getCollection() {
    const { db } = await connectToDatabase();
    return db.collection('organizations');
  }

  static async createOrganization(data: Omit<Organization, '_id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const collection = await this.getCollection();
    
    // Validate slug uniqueness
    const existingOrg = await collection.findOne({ slug: data.slug });
    if (existingOrg) {
      throw new Error('Organization with this slug already exists');
    }

    const now = new Date();
    
    // Convert string IDs to ObjectIds and ensure proper date objects
    const members = data.members?.map(member => ({
      ...member,
      userId: new ObjectId(member.userId.toString()),
      joinedAt: new Date(member.joinedAt)
    })) || [];

    const organization: Organization = {
      ...data,
      members,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(organization);
    return { ...organization, _id: result.insertedId };
  }

  static async getOrganization(identifier: string): Promise<Organization | null> {
    const collection = await this.getCollection();
    
    // Support lookup by either ID or slug
    const query = ObjectId.isValid(identifier)
      ? { _id: new ObjectId(identifier) }
      : { slug: identifier };

    return collection.findOne(query);
  }

  static async updateOrganization(
    id: string,
    data: Partial<Omit<Organization, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Organization | null> {
    const collection = await this.getCollection();
    
    // Validate organization exists
    const existingOrg = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingOrg) {
      throw new Error('Organization not found');
    }

    // If updating slug, validate uniqueness
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await collection.findOne({ 
        slug: data.slug,
        _id: { $ne: new ObjectId(id) }
      });
      if (slugExists) {
        throw new Error('Organization with this slug already exists');
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  static async deleteOrganization(id: string): Promise<{ success: boolean; deletedProjectsCount: number }> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Starting deletion process for organization ${id}`);

    if (!ObjectId.isValid(id)) {
      const error = new Error('Invalid organization ID format');
      console.error(`[${timestamp}] ${error.message}`);
      throw error;
    }

    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
      console.log(`[${timestamp}] Successfully connected to database`);
    } catch (error) {
      const dbError = new Error('Database connection failed');
      console.error(`[${timestamp}] ${dbError.message}:`, 
        error instanceof Error ? error.message : error,
        '\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available'
      );
      throw dbError;
    }

    const session = db.client.startSession();
    
    try {
      console.log(`[${timestamp}] Initiating database transaction`);
      session.startTransaction();
      
      // Initialize deletion result variable with proper type
      let projectsDeletion: { deletedCount: number };
      
      // Delete all projects associated with the organization
      try {
        const projectsCollection = db.collection('projects');
        console.log(`[${timestamp}] Attempting to delete projects for organization ${id}`);
        
        projectsDeletion = await projectsCollection.deleteMany(
          { organizationId: new ObjectId(id) },
          { session }
        );
        console.log(`[${timestamp}] Successfully deleted ${projectsDeletion.deletedCount} projects for organization ${id}`);
      } catch (error) {
        console.error(`[${timestamp}] Failed to delete projects for organization ${id}:`, 
          error instanceof Error ? error.message : error,
          '\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available'
        );
        await session.abortTransaction();
        throw new Error('Failed to delete associated projects');
      }
      
      // Delete the organization
      try {
        const organizationsCollection = await this.getCollection();
        console.log(`[${timestamp}] Attempting to delete organization ${id}`);
        
        const result = await organizationsCollection.deleteOne(
          { _id: new ObjectId(id) },
          { session }
        );
        
        if (result.deletedCount === 1) {
          console.log(`[${timestamp}] Successfully deleted organization ${id}`);
        } else {
          console.error(`[${timestamp}] Organization ${id} not found or could not be deleted`);
          await session.abortTransaction();
          const notFoundError = new Error('Organization not found');
          notFoundError.name = 'NotFoundError';
          throw notFoundError;
        }
        
        console.log(`[${timestamp}] Committing transaction for organization ${id} deletion`);
        await session.commitTransaction();
        console.log(`[${timestamp}] Successfully completed organization ${id} deletion process`);
        return { 
          success: true, 
          deletedProjectsCount: projectsDeletion.deletedCount 
        };
      } catch (error) {
        console.error(`[${timestamp}] Failed to delete organization ${id}:`, 
          error instanceof Error ? error.message : error,
          '\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available'
        );
        await session.abortTransaction();
        throw new Error('Failed to delete organization');
      }
    } catch (error) {
      console.error(`[${timestamp}] Critical error during organization ${id} deletion:`, 
        error instanceof Error ? error.message : error,
        '\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available'
      );
      await session.abortTransaction();
      throw error;
    } finally {
      console.log(`[${timestamp}] Ending database session`);
      await session.endSession();
    }
  }

  static async listOrganizations(options: {
    page?: number;
    limit?: number;
    status?: Organization['status'];
  } = {}): Promise<{ organizations: Organization[]; total: number }> {
    const collection = await this.getCollection();
    const { page = 1, limit = 10, status } = options;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    return { organizations, total };
  }
}
