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
          <main className="w-full nav-offset min-h-[calc(100vh-var(--nav-height))]">
            <div className="content-container">
              {children}
            </div>
          </main>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
