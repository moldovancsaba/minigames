import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { ObjectId } from 'mongodb';

interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  creatorId: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
}

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
    }
  }
}, {
  timestamps: true
});

// Create the model if it doesn't exist
const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

// Ensure IDs are handled consistently
const serializeOrganization = (org: any) => {
  return {
    ...org.toObject(),
    _id: org._id.toString()
  };
};

export class OrganizationService {
  static async createOrganization(data: CreateOrganizationDto) {
    await dbConnect();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const org = await Organization.create({ name: data.name, slug, description: data.description });
    return serializeOrganization(org);
  }

  static async getOrganizations() {
    await dbConnect();
    const orgs = await Organization.find().sort({ createdAt: -1 });
    return orgs.map(serializeOrganization);
  }
}
