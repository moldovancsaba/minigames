// Organization type definitions

interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
}

export interface Organization {
  projects?: any[];
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }[];
  settings: {
    allowPublicProjects: boolean;
    defaultProjectVisibility: 'public' | 'private';
    maxMembers?: number;
    customDomain?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
}

// Define member type
interface OrganizationMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// Define settings type
interface OrganizationSettings {
  allowPublicProjects: boolean;
  defaultProjectVisibility: 'public' | 'private';
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create organization');
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
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete organization');
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
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch organizations');
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }
}
