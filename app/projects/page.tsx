'use client';

import { Suspense } from 'react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Suspense fallback={<div>Loading projects...</div>}>
          {/* Project content will go here */}
          <div className="mt-8">Project management interface coming soon</div>
        </Suspense>
      </div>
    </div>
  );
}
