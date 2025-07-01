import { NextRequest } from 'next/server';
import { clearUserCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  return clearUserCookie();
}
