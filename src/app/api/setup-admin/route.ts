import { NextRequest } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/auth';
import { sendSuccess, sendError } from '@/lib/cms-utils';

export async function GET(request: NextRequest) {
    try {
        const siteId = 'lindsayprecast';
        const email = 'admin@lindsayprecast.com';
        const password = 'password123';

        console.log('Setting up admin user...');

        // Check if user exists
        const existing = await findUserByEmail(email, siteId);

        if (existing) {
            return sendSuccess(
                {
                    userId: existing.userId,
                    email: existing.email,
                    role: existing.role,
                    message: 'Admin user already exists'
                },
                'User already exists'
            );
        }

        // Create user
        const user = await createUser(email, password, 'admin', siteId);

        return sendSuccess(
            {
                userId: user.userId,
                email: user.email,
                role: user.role,
                credentials: {
                    email,
                    password
                }
            },
            'Admin user created successfully'
        );

    } catch (error) {
        console.error('Setup error:', error);
        return sendError('Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
    }
}
