import mongoose from 'mongoose';
import dbConnect from '@/lib/db/init';
import type { Organization } from '@/services/organizationService';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      required: true
    },
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  settings: {
    allowPublicProjects: {
      type: Boolean,
      default: true
    },
    defaultProjectVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    maxMembers: Number,
    customDomain: String
  }
}, {
  timestamps: true
});

// Create the model if it doesn't exist
const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

// Helper function to serialize organization data
export const serializeOrganization = (org: any): Organization => {
  return {
    ...org.toObject(),
    _id: org._id.toString(),
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    members: org.members.map((member: any) => ({
      ...member,
      userId: member.userId.toString(),
      joinedAt: member.joinedAt.toISOString()
    }))
  };
};

export class OrganizationModel {
  static async connect() {
    await dbConnect();
  }

  static async create(data: { name: string; slug: string; description?: string }): Promise<Organization> {
    await this.connect();
    const org = await Organization.create(data);
    return serializeOrganization(org);
  }

  static async findById(id: string): Promise<Organization | null> {
    await this.connect();
    const org = await Organization.findById(id);
    return org ? serializeOrganization(org) : null;
  }

  static async update(id: string, data: Partial<Organization>): Promise<Organization | null> {
    await this.connect();
    const org = await Organization.findByIdAndUpdate(id, data, { new: true });
    return org ? serializeOrganization(org) : null;
  }

  static async delete(id: string): Promise<boolean> {
    await this.connect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all projects associated with the organization
      await mongoose.models.Project.deleteMany({ organizationId: id });
      // Delete the organization itself
      const result = await Organization.findByIdAndDelete(id);
      await session.commitTransaction();
      session.endSession();
      return !!result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async findAll(): Promise<Organization[]> {
    await this.connect();
    const orgs = await Organization.find().sort({ createdAt: -1 });
    return orgs.map(serializeOrganization);
  }

  static async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    await this.connect();
    const query = {
      slug,
      ...(excludeId && { _id: { $ne: excludeId } })
    };
    const existingOrg = await Organization.findOne(query);
    return !existingOrg;
  }
}
