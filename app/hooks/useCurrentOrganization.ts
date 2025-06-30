import { useState, useEffect } from 'react';
import { Organization } from '@/models/organization';

export function useCurrentOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentOrganization() {
      try {
        const response = await fetch('/api/organizations/current');
        if (!response.ok) {
          throw new Error('Failed to fetch current organization');
        }
        const data = await response.json();
        setOrganization(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentOrganization();
  }, []);

  return { organization, loading, error };
}
