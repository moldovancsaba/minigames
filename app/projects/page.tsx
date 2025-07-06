'use client';

import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useProjects } from '@/app/hooks/useProjects';
import { useCurrentOrganization } from '@/app/hooks/useCurrentOrganization';
import { NewProjectModal } from '@/components/client/projects/NewProjectModal';
import { DeleteProjectButton } from '@/components/client/projects/DeleteProjectButton';
import { Button } from '@/components/shared/Button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ProjectType } from '@/app/types/index';

interface ProjectRowProps {
  project: ProjectType;
  organizationName: string;
}

const ProjectRow = ({ project, organizationName }: ProjectRowProps) => {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking delete button
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    window.location.href = `/projects/${project._id}`;
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleRowClick}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
        <span className="text-indigo-600 hover:text-indigo-900">{project.name}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {organizationName}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {project.slug}
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        {project.description}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
        <DeleteProjectButton
          projectId={project._id}
          projectName={project.name}
          organizationId={project.organizationId}
        />
      </td>
    </tr>
  );
};

const LoadingTable = () => {
  // Use a proper key prefix to avoid potential key conflicts
  const placeholderRows = Array.from({ length: 3 }, (_, index) => (
    <div key={`loading-row-${index}`} className="h-16 bg-gray-100 rounded w-full mb-2"></div>
  ));

  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
      {placeholderRows}
    </div>
  );
};

export default function ProjectsPage() {
  const { projects, loading: projectsLoading, error: projectsError, setProjects } = useProjects();
  const [showNewModal, setShowNewModal] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [organizationNames, setOrganizationNames] = useState<Record<string, string>>({});

  // Fetch organization list on mount
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const { data: organizations } = await response.json();
          const names: Record<string, string> = {};
          organizations.forEach((org: any) => {
            names[org._id] = org.name;
          });
          setOrganizationNames(names);
          if (organizations.length > 0) {
            setOrganizationId(organizations[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const loading = projectsLoading;
  const error = projectsError;

  const handleCreateProject = async (data: Partial<ProjectType>) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create project');
    }

    const { data: newProject } = await response.json();
    if (newProject && newProject._id) {
      setProjects(prev => [...(prev || []), newProject]);
      setShowNewModal(false);
    } else {
      throw new Error('Invalid project data received');
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all projects in your organizations.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              type="button"
              onClick={() => {
                if (!organizationId) {
                  alert('Please create an organization first');
                  return;
                }
                setShowNewModal(true);
              }}
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline-block" aria-hidden="true" />
              New Project
            </Button>
            {organizationId && (
              <NewProjectModal
                open={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSubmit={(data) => handleCreateProject({
                  ...data,
                  organizationId: organizationId,
                })}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-8">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 flow-root">
          {loading ? (
            <LoadingTable />
          ) : (
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Organization</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Slug</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!projects || projects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                          No projects found.
                        </td>
                      </tr>
                    ) : projects.map((project) => (
<ProjectRow
  key={project._id}
  project={project}
  organizationName={organizationNames[project.organizationId] || 'Unknown Organization'}
/>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
