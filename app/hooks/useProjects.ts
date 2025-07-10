'use client';

import { useState, useEffect } from 'react';
import { AssociationService } from '@/services/client/associationService';
import { ProjectService } from '@/services/client/projectService';


export interface ProjectType {
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
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let projectData = [];
        if (organizationId) {
          const { projects: orgProjects } = await AssociationService.listOrganizationProjects(organizationId);
          projectData = orgProjects || [];
        } else {
          const response = await fetch('/api/projects');
          if (!response.ok) throw new Error('Failed to fetch projects');
          const { data } = await response.json();
          projectData = data || [];
        }
        
        // Ensure projectData is an array and handle potential null/undefined values
        const projects = Array.isArray(projectData) ? projectData : [];
        setProjects(projects.map((project: ProjectType) => ({
          ...project,
          _id: project._id?.toString() || project._id,
          organizationId: project.organizationId?.toString() || project.organizationId
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
