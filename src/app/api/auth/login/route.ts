import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/cms-models';
import { verifyPassword, generateToken, sendSuccess, sendError } from '@/lib/cms-utils';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, siteId } = body;

        console.log('Login attempt:', { email, siteId });

        // Validation
        if (!email || !password || !siteId) {
            return sendError('email, password, and siteId are required', 400);
        }

        // Find user - case insensitive
        const user = await User.findOne({
            email: email.toLowerCase(),
            siteId
        });

        console.log('User found:', user ? 'yes' : 'no');

        if (!user) {
            return sendError('Invalid email or password', 401);
        }

        // Check if user is active
        if (!user.active) {
            return sendError('User account is inactive', 401);
        }

        // Verify password
        const passwordMatch = verifyPassword(password, user.password);

        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            return sendError('Invalid email or password', 401);
        }

        // Generate token
        const token = generateToken(user._id.toString(), siteId);

        console.log('Login successful for:', email);

        return sendSuccess(
            {
                token,
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            'Login successful'
        );
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return sendError(`Login failed: ${errorMsg}`, 500);
    }
}
