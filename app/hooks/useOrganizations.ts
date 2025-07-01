'use client';

import { useState, useEffect } from 'react';


export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    invitedBy?: string;
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

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        
        const { data } = await response.json();
        setOrganizations(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return { organizations, loading, error, setOrganizations };
}
