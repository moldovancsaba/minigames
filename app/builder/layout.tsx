'use client';

import { ErrorBoundary } from '@/components/client/ErrorBoundary';
import Navigation from '@/components/client/Navigation';
import { Suspense } from 'react';

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Suspense fallback={<div>Loading builder...</div>}>
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
