'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Load ImageUploader with server-side rendering enabled
const ImageUploader = dynamic(
  () => import('@/components/client/ImageUploader'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ),
    ssr: true // Enable server-side rendering
  }
);

export default function AdminPageContent() {
  return (
    <div className="admin-content">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          }
        >
          <ImageUploader />
        </Suspense>
      </div>
    </div>
  );
}
