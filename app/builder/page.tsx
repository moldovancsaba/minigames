'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ImageUploader = dynamic(
  () => import('@/components/client/builder/ImageUploader'),
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
    ssr: true
  }
);

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mosaic Builder</h1>
        <Suspense fallback={<div>Loading builder...</div>}>
          <div className="mt-8">
            <ImageUploader />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
