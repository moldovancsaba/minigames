import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import type { ProjectType } from '@/app/types/index';
import type { Organization } from '@/models/organization';

/**
 * Service for managing relationships between organizations and projects
 * Handles access control, permissions, and relationship integrity
 */
export class AssociationService {
  private static async getProjectCollection() {
    const { db } = await connectToDatabase();
    return db.collection('projects');
  }

  private static async getOrganizationCollection() {
    const { db } = await connectToDatabase();
    return db.collection('organizations');
  }

  /**
   * List all projects for an organization with optional filtering
   */
  static async listOrganizationProjects(
    organizationId: string,
    options: {
      status?: 'active' | 'archived';
      visibility?: 'public' | 'private';
      page?: number;
      limit?: number;
      sort?: 'createdAt' | 'updatedAt' | 'name';
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<{ projects: ProjectType[]; total: number }> {
    const collection = await this.getProjectCollection();
    const {
      status,
      visibility,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = options;

    const query: any = {
      organizationId: new ObjectId(organizationId)
    };

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    const [projects, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    return { projects, total };
  }

  /**
   * Verify if a project belongs to an organization
   */
  static async verifyProjectOrganization(
    projectId: string,
    organizationId: string
  ): Promise<boolean> {
    const collection = await this.getProjectCollection();
    const project = await collection.findOne({
      _id: new ObjectId(projectId),
      organizationId: new ObjectId(organizationId)
    });
    return !!project;
  }

  /**
   * Transfer a project to a different organization
   */
  static async transferProject(
    projectId: string,
    fromOrganizationId: string,
    toOrganizationId: string
  ): Promise<boolean> {
    // Verify project exists in source organization
    const belongsToOrg = await this.verifyProjectOrganization(
      projectId,
      fromOrganizationId
    );
    if (!belongsToOrg) {
      throw new Error('Project does not belong to the source organization');
    }

    // Verify target organization exists
    const orgCollection = await this.getOrganizationCollection();
    const targetOrg = await orgCollection.findOne({
      _id: new ObjectId(toOrganizationId)
    });
    if (!targetOrg) {
      throw new Error('Target organization does not exist');
    }

    // Update project's organization
    const collection = await this.getProjectCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          organizationId: new ObjectId(toOrganizationId),
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount === 1;
  }

  /**
   * Get organization details for a project
   */
  static async getProjectOrganization(projectId: string): Promise<Organization | null> {
    const projectCollection = await this.getProjectCollection();
    const project = await projectCollection.findOne({ _id: new ObjectId(projectId) });
    
    if (!project) {
      throw new Error('Project not found');
    }

    const orgCollection = await this.getOrganizationCollection();
    return orgCollection.findOne({ _id: project.organizationId });
  }

  /**
   * Validate project slug uniqueness within an organization
   */
  static async validateProjectSlug(
    organizationId: string,
    slug: string,
    excludeProjectId?: string
  ): Promise<boolean> {
    const collection = await this.getProjectCollection();
    const query: any = {
      organizationId: new ObjectId(organizationId),
      slug
    };

    if (excludeProjectId) {
      query._id = { $ne: new ObjectId(excludeProjectId) };
    }

    const existingProject = await collection.findOne(query);
    return !existingProject;
  }

  /**
   * Get project statistics for an organization
   */
  static async getOrganizationProjectStats(
    organizationId: string
  ): Promise<{
    total: number;
    active: number;
    archived: number;
    public: number;
    private: number;
  }> {
    const collection = await this.getProjectCollection();
    const orgId = new ObjectId(organizationId);

    const [
      total,
      active,
      archived,
      publicProjects,
      privateProjects
    ] = await Promise.all([
      collection.countDocuments({ organizationId: orgId }),
      collection.countDocuments({ organizationId: orgId, status: 'active' }),
      collection.countDocuments({ organizationId: orgId, status: 'archived' }),
      collection.countDocuments({ organizationId: orgId, visibility: 'public' }),
      collection.countDocuments({ organizationId: orgId, visibility: 'private' })
    ]);

    return {
      total,
      active,
      archived,
      public: publicProjects,
      private: privateProjects
    };
  }

  /**
   * Archive all projects in an organization
   */
  static async archiveOrganizationProjects(
    organizationId: string
  ): Promise<number> {
    const collection = await this.getProjectCollection();
    const result = await collection.updateMany(
      { organizationId: new ObjectId(organizationId), status: 'active' },
      {
        $set: {
          status: 'archived',
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount;
  }

  /**
   * Update visibility of all projects in an organization
   */
  static async updateOrganizationProjectsVisibility(
    organizationId: string,
    visibility: 'public' | 'private'
  ): Promise<number> {
    const collection = await this.getProjectCollection();
    const result = await collection.updateMany(
      { organizationId: new ObjectId(organizationId) },
      {
        $set: {
          visibility,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount;
  }
}
