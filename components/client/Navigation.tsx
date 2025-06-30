'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
