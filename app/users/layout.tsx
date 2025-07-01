'use client';

import { ErrorBoundary } from '@/components/client/ErrorBoundary';
import Navigation from '@/components/client/Navigation';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="w-full nav-offset min-h-[calc(100vh-var(--nav-height))]">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
}
