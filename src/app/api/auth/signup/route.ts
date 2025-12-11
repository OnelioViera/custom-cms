import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/cms-models';
import { hashPassword, generateToken, sendSuccess, sendError } from '@/lib/cms-utils';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, siteId } = body;

        // Validation
        if (!email || !password || !siteId) {
            return sendError('email, password, and siteId are required', 400);
        }

        if (password.length < 8) {
            return sendError('Password must be at least 8 characters', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email, siteId });

        if (existingUser) {
            return sendError('User with this email already exists', 409);
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Create new user
        const newUser = new User({
            siteId,
            email,
            password: hashedPassword,
            role: 'editor',
            active: true,
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id.toString(), siteId);

        return sendSuccess(
            {
                token,
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
            'Account created successfully',
            201
        );
    } catch (error) {
        console.error('Signup error:', error);
        return sendError('Signup failed', 500);
    }
}
