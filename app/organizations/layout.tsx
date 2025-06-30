'use client';

import { ErrorBoundary } from '@/components/client/ErrorBoundary';
import Navigation from '@/components/client/Navigation';
import { Suspense } from 'react';

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Suspense fallback={<div>Loading organizations...</div>}>
          <main className="py-10">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
