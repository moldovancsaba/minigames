'use client';

import { useState, useEffect } from 'react';


export interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  visibility: 'public' | 'private';
  status: 'active' | 'archived';
  settings: {
    allowComments: boolean;
    moderateComments: boolean;
    enableSharing: boolean;
    allowDownloads: boolean;
    maxImageSize?: number;
    allowedFileTypes: string[];
  };
  metadata: {
    totalImages: number;
    lastActivity: string;
    tags: string[];
    contributors: {
      userId: string;
      role: 'owner' | 'editor' | 'viewer';
      joinedAt: string;
      permissions: string[];
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export function useProjects(organizationId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const url = organizationId 
          ? `/api/organizations/${organizationId}/projects`
          : '/api/projects';
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch projects');
        
        const { data } = await response.json();
        const projectData = Array.isArray(data) ? data : data?.projects || [];
        setProjects(projectData.map((project: Omit<Project, '_id'> & { _id: string | { toString(): string } }) => ({
          ...project,
          _id: project._id.toString()
        })));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [organizationId]);

  return { projects, loading, error, setProjects };
}
