import { NextRequest } from 'next/server';

export type RouteHandlerContext<T = Record<string, string>> = {
  params: T;
};

export type RouteSegment<T = Record<string, string>> = (
  request: NextRequest,
  context: RouteHandlerContext<T>
) => Promise<Response>;
