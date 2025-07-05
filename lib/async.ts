import { Metadata } from 'next';

export interface PageParams {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function withPageMetadata<T extends PageParams>(
  component: (props: T) => Promise<Metadata>
): (props: T) => Promise<Metadata> {
  return async (props: T) => {
    return component(props);
  };
}

export function withAsyncPage<T extends PageParams>(
  component: (props: T) => Promise<JSX.Element>
): (props: T) => Promise<JSX.Element> {
  return async (props: T) => {
    return component(props);
  };
}
