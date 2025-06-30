'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/shared/LoadingState';

const ImageUploader = dynamic(
  () => import('@/components/client/builder/ImageUploader'),
  {
    loading: () => <LoadingState />,
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
