'use client';

import Link from 'next/link';
import { ProjectType } from '@/app/types/index';

interface ProjectListProps {
  projects: ProjectType[];
  organizationId: string;
  organizationName: string;
}

export function ProjectList({ projects, organizationId, organizationName }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project._id}>
            <Link
              href={`/app/projects/${project._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">
                        {project.name}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        in {organizationName}
                      </p>
                    </div>
                    {project.description && (
                      <div className="mt-2 flex">
                        <div className="text-sm text-gray-500">
                          {project.description}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-2 flex flex-shrink-0">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
