import { NextResponse } from 'next/server';

export function proxy(request) {
  // gets token
  const token = request.cookies.get('token')?.value;

  // check if user is trying to access a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // if its a protected route and there is no token, redirect to home
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // continue as normal if authenticated or on a public route
  return NextResponse.next();
}

// tell nextjs which paths this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*'],
};
