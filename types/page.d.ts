// Type definitions for Next.js App Router pages
import type { Metadata } from 'next';

// Custom type for page parameters
export type AppParams<T> = { params: T };

// Type for page props that works around Next.js type system bug
export type AppPageProps<T = any> = {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Re-export for backwards compatibility
export type PageParams<T = any> = AppParams<T>;
export type PageParamsProps<T = any> = AppPageProps<T>;
