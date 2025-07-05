import { ObjectId } from 'mongodb';

// Organization interface for TypeScript type safety
export interface Organization {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'archived';
  members: OrganizationMember[];
  settings: OrganizationSettings;
}

// Member interface for organization members
export interface OrganizationMember {
  userId: ObjectId;
  projects: ObjectId[]; // Array of project IDs associated with the organization
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  invitedBy?: ObjectId;
}

// Settings interface for organization configuration
export interface OrganizationSettings {
  allowPublicProjects: boolean;
  defaultProjectVisibility: 'public' | 'private';
  maxMembers?: number;
  customDomain?: string;
}

// MongoDB schema validation rules
export const organizationSchema = {
  bsonType: 'object',
  required: ['name', 'slug', 'createdAt', 'updatedAt', 'status', 'members', 'settings'],
  properties: {
    name: {
      bsonType: 'string',
      minLength: 2,
      maxLength: 100,
      description: 'Organization name - required string between 2 and 100 characters'
    },
    slug: {
      bsonType: 'string',
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      minLength: 2,
      maxLength: 50,
      description: 'URL-friendly version of name - required string matching slug pattern'
    },
    description: {
      bsonType: ['string', 'null'],
      maxLength: 1000,
      description: 'Optional organization description'
    },
    createdAt: {
      bsonType: 'date',
      description: 'Timestamp of organization creation'
    },
    updatedAt: {
      bsonType: 'date',
      description: 'Timestamp of last organization update'
    },
    status: {
      enum: ['active', 'inactive', 'archived'],
      description: 'Organization status'
    },
    members: {
      bsonType: 'array',
      minItems: 1,
      items: {
        bsonType: 'object',
        required: ['userId', 'role', 'joinedAt'],
        properties: {
          userId: {
            bsonType: 'objectId',
            description: 'Reference to user document'
          },
          role: {
            enum: ['owner', 'admin', 'member'],
            description: 'Member role within organization'
          },
          joinedAt: {
            bsonType: 'date',
            description: 'Timestamp when member joined'
          },
          invitedBy: {
            bsonType: ['objectId', 'null'],
            description: 'Reference to user who sent invitation'
          }
        }
      }
    },
    settings: {
      bsonType: 'object',
      required: ['allowPublicProjects', 'defaultProjectVisibility'],
      properties: {
        allowPublicProjects: {
          bsonType: 'bool',
          description: 'Whether organization allows public projects'
        },
        defaultProjectVisibility: {
          enum: ['public', 'private'],
          description: 'Default visibility for new projects'
        },
        maxMembers: {
          bsonType: ['int', 'null'],
          minimum: 1,
          description: 'Optional maximum number of members'
        },
        customDomain: {
          bsonType: ['string', 'null'],
          pattern: '^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\\.)+[a-zA-Z]{2,}$',
          description: 'Optional custom domain for organization'
        }
      }
    }
  }
};
