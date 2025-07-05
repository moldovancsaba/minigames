'use client';

import { ProjectList } from '@/components/shared/ProjectList';

interface OrganizationPageProps {
  organization: {
    _id: string;
    name: string;
    description?: string;
  };
  projects: any[];
}

export function OrganizationPageClient({ organization, projects }: OrganizationPageProps) {
  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
            {organization.description && (
              <p className="mt-2 text-sm text-gray-700">{organization.description}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Projects</h2>
          <div className="mt-4">
            <ProjectList 
              projects={projects} 
              organizationId={organization._id}
              organizationName={organization.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
