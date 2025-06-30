import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { Project, ProjectSettings, ProjectMetadata } from '@/models/project';

export class ProjectService {
  private static async getCollection() {
    const { db } = await connectToDatabase();
    return db.collection('projects');
  }

  /**
   * Create a new project
   * @param data Project data excluding _id, createdAt, and updatedAt
   * @returns Newly created project
   */
  static async createProject(
    data: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    const collection = await this.getCollection();

    // Validate slug uniqueness within the organization
    const existingProject = await collection.findOne({
      organizationId: data.organizationId,
      slug: data.slug
    });

    if (existingProject) {
      throw new Error('Project with this slug already exists in the organization');
    }

    const now = new Date();
    const project: Project = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(project);
    return { ...project, _id: result.insertedId };
  }

  /**
   * Get a project by its ID or slug
   * @param identifier Project ID or slug
   * @param organizationId Optional organization ID for slug lookup
   * @returns Project or null if not found
   */
  static async getProject(
    identifier: string,
    organizationId?: string
  ): Promise<Project | null> {
    const collection = await this.getCollection();

    const query = ObjectId.isValid(identifier)
      ? { _id: new ObjectId(identifier) }
      : organizationId
      ? { slug: identifier, organizationId: new ObjectId(organizationId) }
      : { slug: identifier };

    return collection.findOne(query);
  }

  /**
   * Update a project
   * @param id Project ID
   * @param data Updated project data
   * @returns Updated project
   */
  static async updateProject(
    id: string,
    data: Partial<Omit<Project, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Project | null> {
    const collection = await this.getCollection();

    // Validate project exists
    const existingProject = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // If updating slug, validate uniqueness within organization
    if (data.slug && data.slug !== existingProject.slug) {
      const slugExists = await collection.findOne({
        organizationId: existingProject.organizationId,
        slug: data.slug,
        _id: { $ne: new ObjectId(id) }
      });

      if (slugExists) {
        throw new Error('Project with this slug already exists in the organization');
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

  /**
   * Delete a project
   * @param id Project ID
   * @returns true if project was deleted, false if not found
   */
  static async deleteProject(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * List projects with optional filtering and pagination
   * @param options Filter and pagination options
   * @returns Projects and total count
   */
  static async listProjects(options: {
    organizationId?: string;
    visibility?: Project['visibility'];
    status?: Project['status'];
    page?: number;
    limit?: number;
    tags?: string[];
  } = {}): Promise<{ projects: Project[]; total: number }> {
    const collection = await this.getCollection();
    const {
      organizationId,
      visibility,
      status,
      page = 1,
      limit = 10,
      tags
    } = options;

    const query: any = {};
    
    if (organizationId) {
      query.organizationId = new ObjectId(organizationId);
    }
    if (visibility) {
      query.visibility = visibility;
    }
    if (status) {
      query.status = status;
    }
    if (tags && tags.length > 0) {
      query['metadata.tags'] = { $all: tags };
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    return { projects, total };
  }

  /**
   * Update project settings
   * @param id Project ID
   * @param settings Updated settings
   * @returns Updated project
   */
  static async updateProjectSettings(
    id: string,
    settings: Partial<ProjectSettings>
  ): Promise<Project | null> {
    const collection = await this.getCollection();

    const updateData = {
      'settings': settings,
      'updatedAt': new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  /**
   * Update project metadata
   * @param id Project ID
   * @param metadata Updated metadata
   * @returns Updated project
   */
  static async updateProjectMetadata(
    id: string,
    metadata: Partial<ProjectMetadata>
  ): Promise<Project | null> {
    const collection = await this.getCollection();

    const updateData = {
      'metadata': metadata,
      'updatedAt': new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}
