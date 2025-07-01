'use client';

import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

function NavigationContent() {
  const { isAdmin, user, logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50" style={{ height: 'var(--nav-height)' }}>
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex justify-between w-full">
            <div className="flex space-x-8">
            <Link 
              href="/mosaic"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
            >
              Mosaic
            </Link>
            <Link 
              href="/organizations"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
            >
              Organizations
            </Link>
            <Link 
              href="/projects"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
            >
              Projects
            </Link>
            <Link 
              href="/builder"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
            >
              Builder
            </Link>
            {isAdmin && (
              <Link 
                href="/users"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-500"
              >
                Users
              </Link>
            )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Navigation() {
  return (
    <Suspense fallback={<nav className="fixed top-0 left-0 w-full bg-white shadow z-50" style={{ height: 'var(--nav-height)' }}></nav>}>
      <NavigationContent />
    </Suspense>
  );
}
