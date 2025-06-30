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
    const organization: Organization = {
      ...data,
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

  static async deleteOrganization(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
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
