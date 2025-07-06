import { useEffect, useState } from 'react';
import type { Organization } from '@/services/client/organizationService';
import { OrganizationService } from '@/services/client/organizationService';

interface UseCurrentOrganizationReturn {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentOrganization(organizationId?: string): UseCurrentOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const org = await OrganizationService.getOrganization(organizationId);
        setOrganization(org);
      } catch (error) {
        console.error('Error fetching organization:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  return { organization, loading, error };
}
