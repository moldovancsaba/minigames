import type { Organization } from '@/services/organizationService';
export type { Organization };

export interface OrganizationMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  projects: string[];
}

interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
  members?: OrganizationMember[];
  settings?: {
    allowPublicProjects?: boolean;
    defaultProjectVisibility?: 'public' | 'private';
    maxMembers?: number;
    customDomain?: string;
  };
}

export class OrganizationService {
  static async createOrganization(data: CreateOrganizationDto): Promise<Organization | null> {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Unable to create organization');
      }

      const { data: newOrg } = await response.json();
      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  static async deleteOrganization(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Organization not found or could not be deleted');
      }

      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }

  static async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('Unable to retrieve organizations');
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }

  static async getOrganization(id: string): Promise<Organization | null> {
    try {
      const response = await fetch(`/api/organizations/${id}`);
      if (!response.ok) {
        throw new Error('Organization not found');
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }
}
