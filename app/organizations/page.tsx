'use client';

import { type Organization } from '@/services/client/organizationService';
import { OrganizationService } from '@/services/client/organizationService';

import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useOrganizations } from '@/app/hooks/useOrganizations';
import { NewOrganizationModal } from '@/components/client/organizations/NewOrganizationModal';
import { DeleteOrganizationButton } from '@/components/client/organizations/DeleteOrganizationButton';
import { Button } from '@/components/shared/Button';

interface OrganizationRowProps {
  organization: Organization;
  projectCount?: number;
}

const OrganizationRow: React.FC<OrganizationRowProps> = ({ organization, projectCount }) => {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking delete button
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    window.location.href = `/organizations/${organization._id}`;
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleRowClick}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
        <span className="text-indigo-600 hover:text-indigo-900">{organization.name}</span>
        {projectCount !== undefined && (
          <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {organization.slug}
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        {organization.description}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
        <DeleteOrganizationButton
          organizationId={organization._id}
          organizationName={organization.name}
        />
      </td>
    </tr>
  );
};

const LoadingTable = () => {
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

export default function OrganizationsPage() {
  const { organizations = [], loading, error, setOrganizations } = useOrganizations();
  const [showNewModal, setShowNewModal] = useState(false);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  // Fetch project counts for each organization
  React.useEffect(() => {
    const fetchProjectCounts = async () => {
      const counts: Record<string, number> = {};
      for (const org of organizations) {
        try {
          const response = await fetch(`/api/organizations/${org._id}/projects/stats`);
          if (response.ok) {
            const { count } = await response.json();
            counts[org._id] = count;
          }
        } catch (error) {
          console.error(`Failed to fetch project count for organization ${org._id}:`, error);
        }
      }
      setProjectCounts(counts);
    };

    if (organizations.length > 0) {
      fetchProjectCounts();
    }
  }, [organizations]);

const handleCreateOrganization = async (data: { name: string; slug?: string; description?: string }) => {
    try {
      const newOrg = await OrganizationService.createOrganization({
        ...data,
      });
      if (newOrg && newOrg._id) {
        setOrganizations(prev => [...prev, newOrg]);
        setShowNewModal(false);
      } else {
        throw new Error('Invalid organization data received');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all organizations you have access to.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              type="button"
              onClick={() => setShowNewModal(true)}
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline-block" aria-hidden="true" />
              New Organization
            </Button>
            <NewOrganizationModal
              open={showNewModal}
              onClose={() => setShowNewModal(false)}
              onSubmit={handleCreateOrganization}
            />
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
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Slug</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {organizations?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                          No organizations found.
                        </td>
                      </tr>
    ) : (organizations || []).map((org: Organization) => (
<OrganizationRow
  key={org._id?.toString()}
  organization={org}
  projectCount={projectCounts[org._id]}
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
