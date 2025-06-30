'use client';

import { ErrorBoundary } from '@/components/client/ErrorBoundary';
import Navigation from '@/components/client/Navigation';
import { Suspense } from 'react';

export default function AdminClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Suspense fallback={<div>Loading admin content...</div>}>
          {children}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
