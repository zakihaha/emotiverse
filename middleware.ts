import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')

    // Protect routes starting with /dashboard or /chat
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

    // If it's a protected route and no token, redirect to login page
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/', request.url)); // Redirect to login
    }

    return NextResponse.next();
}

// Only apply the middleware to these routes
export const config = {
    matcher: ['/dashboard/:path*'],
};
