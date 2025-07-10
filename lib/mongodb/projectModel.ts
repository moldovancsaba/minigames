import mongoose from 'mongoose';
import dbConnect from '@/lib/db/init';
import { ProjectType } from '@/app/types/index';

const projectSchema = new mongoose.Schema({
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
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    moderateComments: {
      type: Boolean,
      default: false
    },
    enableSharing: {
      type: Boolean,
      default: true
    },
    allowDownloads: {
      type: Boolean,
      default: true
    },
    maxImageSize: Number,
    allowedFileTypes: [String]
  },
  metadata: {
    totalImages: {
      type: Number,
      default: 0
    },
    lastActivity: Date,
    tags: [String],
    contributors: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['owner', 'editor', 'viewer'],
        required: true
      },
      joinedAt: {
        type: Date,
        required: true,
        default: Date.now
      },
      permissions: [String]
    }]
  }
}, {
  timestamps: true
});

// Create the model if it doesn't exist
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

// Helper function to serialize project data
export const serializeProject = (project: any): ProjectType => {
  return {
    ...project.toObject(),
    _id: project._id.toString(),
    organizationId: project.organizationId.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    metadata: {
      ...project.metadata,
      lastActivity: project.metadata?.lastActivity?.toISOString(),
      contributors: Array.isArray(project.metadata?.contributors)
        ? project.metadata.contributors.map((contributor: any) => ({
            ...contributor,
            userId: contributor.userId?.toString() || contributor.userId,
            joinedAt: contributor.joinedAt?.toISOString() || contributor.joinedAt
          }))
        : []
    }
  };
};

export class ProjectModel {
  static async connect() {
    await dbConnect();
  }

  static async create(data: Omit<ProjectType, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProjectType> {
    try {
      console.log('Connecting to MongoDB...');
      await this.connect();
      console.log('Creating project with data:', data);
      const project = await Project.create(data);
      console.log('Project created successfully:', project);
      return serializeProject(project);
    } catch (error) {
      console.error('Error in ProjectModel.create:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<ProjectType | null> {
    await this.connect();
    const project = await Project.findById(id);
    return project ? serializeProject(project) : null;
  }

  static async update(id: string, data: Partial<ProjectType>): Promise<ProjectType | null> {
    await this.connect();
    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    return project ? serializeProject(project) : null;
  }

  static async delete(id: string): Promise<boolean> {
    await this.connect();
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  }

  static async findByOrganization(organizationId: string): Promise<ProjectType[]> {
    await this.connect();
    const projects = await Project.find({ organizationId });
    return projects.map(serializeProject);
  }

  static async validateSlug(organizationId: string, slug: string, excludeId?: string): Promise<boolean> {
    await this.connect();
    const query = {
      organizationId,
      slug,
      ...(excludeId && { _id: { $ne: excludeId } })
    };
    const existingProject = await Project.findOne(query);
    return !existingProject;
  }

  static async findAll(): Promise<ProjectType[]> {
    await this.connect();
    const projects = await Project.find().sort({ createdAt: -1 });
    return projects.map(serializeProject);
  }
}
