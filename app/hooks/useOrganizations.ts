'use client';

import { useState, useEffect } from 'react';
import type { Organization } from '@/app/types/organization';
import { OrganizationService } from '@/services/organization';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await OrganizationService.listOrganizations();
        // Validate that data is an array before setting
        setOrganizations(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Ensure organizations is always an array even on error
        setOrganizations([]);
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return { organizations, loading, error, setOrganizations };
}
