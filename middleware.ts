import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Get JWT secret as Uint8Array for jose library
function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return new TextEncoder().encode(secret);
}

async function verifyTokenMiddleware(token: string): Promise<boolean> {
    try {
        const secret = getJwtSecret();
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    // Check if user is accessing admin routes
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
        // Check for auth token in cookies
        const token = request.cookies.get('authToken')?.value;

        // If no token, redirect to login
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Verify the token is valid
        const isValid = await verifyTokenMiddleware(token);
        if (!isValid) {
            // Clear invalid token and redirect to login
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('authToken');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard/:path*'],
};
