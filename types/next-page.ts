import type { Metadata } from 'next';

export interface PageParams<T = any> {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface PageContext<T = any> {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
  generateMetadata?: () => Promise<Metadata>;
}
