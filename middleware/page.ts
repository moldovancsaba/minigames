export type PageParams<T> = {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type PageProps<T = { [key: string]: string }> = PageParams<T>;

export function withPageProps<T>(component: (props: PageProps<T>) => Promise<any>) {
  return component;
}
