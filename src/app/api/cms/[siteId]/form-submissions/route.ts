import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { FormSubmission } from '@/lib/cms-models';
import {
    sendSuccess,
    sendError,
    withDB,
    getPaginationParams,
    triggerWebhooks
} from '@/lib/cms-utils';

// ============================================================================
// GET - Fetch all form submissions
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;

    return withDB(async () => {
        if (!siteId) {
            return sendError('siteId is required', 400);
        }

        try {
            const { limit, skip } = getPaginationParams(request);
            const status = request.nextUrl.searchParams.get('status');
            const search = request.nextUrl.searchParams.get('q');

            // Build query
            let query: any = { siteId };

            if (status) {
                query.status = status;
            }

            // Add search functionality
            if (search) {
                query.$or = [
                    { 'data.firstName': { $regex: search, $options: 'i' } },
                    { 'data.lastName': { $regex: search, $options: 'i' } },
                    { 'data.email': { $regex: search, $options: 'i' } },
                    { title: { $regex: search, $options: 'i' } },
                ];
            }

            const submissions = await FormSubmission.find(query)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 });

            const total = await FormSubmission.countDocuments(query);

            return sendSuccess({
                submissions,
                pagination: {
                    total,
                    limit,
                    skip,
                    hasMore: skip + limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching form submissions:', error);
            return sendError('Failed to fetch form submissions', 500);
        }
    });
}

// ============================================================================
// POST - Create a new form submission
// ============================================================================

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;

    return withDB(async () => {
        if (!siteId) {
            return sendError('siteId is required', 400);
        }

        try {
            const body = await request.json();
            const { firstName, lastName, email, phone, projectType, projectSize, description } = body;

            // Validation
            if (!firstName || !lastName || !email) {
                return sendError('firstName, lastName, and email are required', 400);
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return sendError('Invalid email format', 400);
            }

            // Create form submission
            const title = `${firstName} ${lastName}`;
            const newSubmission = new FormSubmission({
                siteId,
                title,
                data: {
                    firstName,
                    lastName,
                    email,
                    ...(phone && { phone }),
                    ...(projectType && { projectType }),
                    ...(projectSize && { projectSize }),
                    ...(description && { description }),
                },
                status: 'new',
            });

            await newSubmission.save();

            // Trigger webhook
            await triggerWebhooks(siteId, 'form.submitted', {
                submissionId: newSubmission._id,
                title,
                email,
                data: newSubmission.data,
            });

            return sendSuccess(newSubmission, 'Form submission received successfully', 201);
        } catch (error) {
            console.error('Error creating form submission:', error);
            return sendError('Failed to process form submission', 500);
        }
    });
}
