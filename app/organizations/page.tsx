'use client';

import { Suspense } from 'react';

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <Suspense fallback={<div>Loading organizations...</div>}>
          {/* Organization content will go here */}
          <div className="mt-8">Organization management interface coming soon</div>
        </Suspense>
      </div>
    </div>
  );
}
