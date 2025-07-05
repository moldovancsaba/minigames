'use client';

import Link from 'next/link';
import { EditProjectButton } from '@/components/client/projects/EditProjectButton';
import { DeleteProjectButton } from '@/components/client/projects/DeleteProjectButton';

import type { Project } from '@/app/types/index';

interface ProjectPageProps {
  project: Project;
  organization: {
    _id: string;
    name: string;
  };
}

export function ProjectPageClient({ project, organization }: ProjectPageProps) {
  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center space-x-2">
              <Link
                href={`/app/organization/${organization._id}`}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                {organization.name}
              </Link>
              <span className="text-gray-500">/</span>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-gray-700">{project.description}</p>
            )}
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
            <EditProjectButton project={project} />
            <DeleteProjectButton 
              projectId={project._id}
              projectName={project.name}
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.status}</dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Visibility</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.visibility}</dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Project Settings</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Comments</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {project.settings.allowComments ? 'Enabled' : 'Disabled'}
                {project.settings.allowComments && project.settings.moderateComments && 
                  ' (Moderated)'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Sharing</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {project.settings.enableSharing ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Downloads</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {project.settings.allowDownloads ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Project Metadata</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Total Images</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {project.metadata.totalImages}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Last Activity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.metadata.lastActivity).toLocaleDateString()}
              </dd>
            </div>
            {project.metadata.tags.length > 0 && (
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.metadata.tags.join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
