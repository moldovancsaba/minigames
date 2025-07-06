import type { Organization } from '../organizationService';

export class OrganizationApi {
  static async getOrganization(id: string): Promise<Organization | null> {
    try {
      const response = await fetch(`/api/organizations/${id}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch organization');
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }

  static async createOrganization(data: { name: string; slug?: string; description?: string }): Promise<Organization | null> {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
