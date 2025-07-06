import type { ProjectType } from '@/app/types/index';
import type { Organization } from '@/services/organizationService';

interface ListProjectsOptions {
  status?: 'active' | 'archived';
  visibility?: 'public' | 'private';
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export class AssociationClient {
  static async listOrganizationProjects(
    organizationId: string,
    options: ListProjectsOptions = {}
  ): Promise<{ projects: ProjectType[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options)) {
        if (value) queryParams.append(key, value.toString());
      }

      const response = await fetch(`/api/organizations/${organizationId}/projects?${queryParams}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch organization projects');
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organization projects:', error);
      throw error;
    }
  }

  static async verifyProjectOrganization(
    projectId: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/projects/${projectId}/verify`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to verify project organization');
      }

      const { verified } = await response.json();
      return verified;
    } catch (error) {
      console.error('Error verifying project organization:', error);
      throw error;
    }
  }

  static async validateProjectSlug(
    organizationId: string,
    slug: string,
    excludeProjectId?: string
  ): Promise<boolean> {
    try {
      const queryParams = new URLSearchParams({
        slug,
        ...(excludeProjectId && { excludeProjectId })
      });

      const response = await fetch(`/api/organizations/${organizationId}/projects/validate-slug?${queryParams}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to validate project slug');
      }

      const { isValid } = await response.json();
      return isValid;
    } catch (error) {
      console.error('Error validating project slug:', error);
      throw error;
    }
  }

  static async transferProject(
    projectId: string,
    fromOrganizationId: string,
    toOrganizationId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/projects/${projectId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromOrganizationId,
          toOrganizationId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to transfer project');
      }

      const { success } = await response.json();
      return success;
    } catch (error) {
      console.error('Error transferring project:', error);
      throw error;
    }
  }

  static async getProjectOrganization(projectId: string): Promise<Organization | null> {
    try {
      const response = await fetch(`/api/projects/${projectId}/organization`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch project organization');
      }

      const { data: organization } = await response.json();
      return organization;
    } catch (error) {
      console.error('Error fetching project organization:', error);
      throw error;
    }
  }
}
