import type { Organization } from '@/app/types/organization';
import { OrganizationModel } from '../models/organization';
import dbConnect from '../lib/db/init';

export class OrganizationService {
  static async createOrganization(data: Omit<Organization, '_id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    await dbConnect();
    const now = new Date().toISOString();
    const document = {
      name: data.name,
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
    };

    const organization = await OrganizationModel.create(document);
    const org = organization.toObject();
    
    const { _id, ...rest } = org;
    return {
      _id: _id.toString(),
      ...rest
    };
  }

  static async getOrganization(id: string): Promise<Organization | null> {
    await dbConnect();
    const organization = await OrganizationModel.findById(id).lean() as any;
    if (!organization) return null;
    
    const { _id, ...rest } = organization;
    return {
      _id: _id.toString(),
      ...rest
    };
  }

  static async updateOrganization(
    id: string,
    data: Partial<Pick<Organization, 'name' | 'description'>>
  ): Promise<Organization | null> {
    await dbConnect();
    const now = new Date().toISOString();
    const organization = (await OrganizationModel.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedAt: now,
      },
      { new: true }
    ).lean()) as any;

    if (!organization) return null;
    
    const { _id, ...rest } = organization;
    return {
      _id: _id.toString(),
      ...rest
    };
  }

  static async deleteOrganization(id: string): Promise<boolean> {
    await dbConnect();
    const result = await OrganizationModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  static async listOrganizations(): Promise<Organization[]> {
    await dbConnect();
    const organizations = await OrganizationModel.find()
      .sort({ createdAt: -1 })
      .lean() as any[];
    
    return organizations.map(org => {
      const { _id, ...rest } = org;
      return {
        _id: _id.toString(),
        ...rest
      };
    });
  }
}
