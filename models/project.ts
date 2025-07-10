import { ObjectId } from 'mongodb';

/**
 * Project interface for TypeScript type safety
 * Represents a collection of mosaics with specific settings and permissions
 */
export interface ProjectType {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  organizationId: ObjectId;
  visibility: 'public' | 'private';
  status: 'active' | 'archived';
  settings: ProjectSettings;
  startDate?: Date;
  metadata: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
  organization?: {
    name: string;
    description?: string;
  };
}

/**
 * Project settings interface
 * Configurable options for project behavior
 */
export interface ProjectSettings {
  allowComments: boolean;
  moderateComments: boolean;
  enableSharing: boolean;
  allowDownloads: boolean;
  allowedFileTypes: string[]; // Allowed file types for project assets
}

/**
 * Project metadata interface
 * Additional information and statistics about the project
 */
export interface ProjectMetadata {
  lastActivity: Date;
  tags: string[];
  contributors: ProjectContributor[];
}

/**
 * Project contributor interface
 * Represents users with specific roles and permissions within a project
 */
export interface ProjectContributor {
  userId: ObjectId;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  permissions: string[]; // e.g., ['upload', 'delete', 'modify']
}

/**
 * MongoDB schema validation rules for projects
 */
export const projectSchema = {
  bsonType: 'object',
  required: [
    'name',
    'slug',
    'organizationId',
    'visibility',
    'status',
    'settings',
    'metadata',
    'createdAt',
    'updatedAt'
  ],
  properties: {
    name: {
      bsonType: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'Project name - required string between 1 and 100 characters'
    },
    slug: {
      bsonType: 'string',
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      minLength: 1,
      maxLength: 50,
      description: 'URL-friendly version of name - required string matching slug pattern'
    },
    description: {
      bsonType: ['string', 'null'],
      maxLength: 1000,
      description: 'Optional project description'
    },
    organizationId: {
      bsonType: 'objectId',
      description: 'Reference to parent organization'
    },
    visibility: {
      enum: ['public', 'private'],
      description: 'Project visibility setting'
    },
    status: {
      enum: ['active', 'archived'],
      description: 'Project status'
    },
    settings: {
      bsonType: 'object',
      required: [
        'allowComments',
        'moderateComments',
        'enableSharing',
        'allowDownloads',
        'allowedFileTypes'
      ],
      properties: {
        allowComments: {
          bsonType: 'bool',
          description: 'Whether comments are allowed on project images'
        },
        moderateComments: {
          bsonType: 'bool',
          description: 'Whether comments require moderation'
        },
        enableSharing: {
          bsonType: 'bool',
          description: 'Whether sharing features are enabled'
        },
        allowDownloads: {
          bsonType: 'bool',
          description: 'Whether image downloads are allowed'
        },
        allowedFileTypes: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'string',
            description: 'Allowed file extensions'
          }
        }
      }
    },
    metadata: {
      bsonType: 'object',
      required: ['lastActivity', 'tags', 'contributors'],
      properties: {
        lastActivity: {
          bsonType: 'date',
          description: 'Timestamp of last project activity'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
            description: 'Project tags for categorization'
          }
        },
        contributors: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['userId', 'role', 'joinedAt', 'permissions'],
            properties: {
              userId: {
                bsonType: 'objectId',
                description: 'Reference to user document'
              },
              role: {
                enum: ['owner', 'editor', 'viewer'],
                description: 'Contributor role within project'
              },
              joinedAt: {
                bsonType: 'date',
                description: 'Timestamp when contributor joined'
              },
              permissions: {
                bsonType: 'array',
                items: {
                  bsonType: 'string',
                  description: 'Specific permissions granted to contributor'
                }
              }
            }
          }
        }
      }
    },
    createdAt: {
      bsonType: 'date',
      description: 'Timestamp of project creation'
    },
    updatedAt: {
      bsonType: 'date',
      description: 'Timestamp of last project update'
    }
  }
};
