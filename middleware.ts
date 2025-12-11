import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if user is accessing admin routes
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
        // Check for auth token in cookies
        const token = request.cookies.get('authToken')?.value;

        // If no token, redirect to login
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard/:path*'],
};
