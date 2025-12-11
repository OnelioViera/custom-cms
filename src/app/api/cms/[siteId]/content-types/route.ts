import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContentType } from '@/lib/cms-models';
import {
    sendSuccess,
    sendError,
    withDB,
    getPaginationParams
} from '@/lib/cms-utils';

// ============================================================================
// GET - Fetch all content types for a site
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

            const contentTypes = await ContentType.find({ siteId })
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 });

            const total = await ContentType.countDocuments({ siteId });

            return sendSuccess({
                contentTypes,
                pagination: {
                    total,
                    limit,
                    skip,
                    hasMore: skip + limit < total,
                },
            });
        } catch (error) {
            console.error('Error fetching content types:', error);
            return sendError('Failed to fetch content types', 500);
        }
    });
}

// ============================================================================
// POST - Create a new content type
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
            const { contentTypeId, name, description, fields } = body;

            // Validation
            if (!contentTypeId || !name) {
                return sendError('contentTypeId and name are required', 400);
            }

            if (!Array.isArray(fields) || fields.length === 0) {
                return sendError('fields must be a non-empty array', 400);
            }

            // Check if content type already exists
            const existing = await ContentType.findOne({ siteId, contentTypeId });
            if (existing) {
                return sendError('Content type with this ID already exists', 409);
            }

            // Create new content type
            const newContentType = new ContentType({
                siteId,
                contentTypeId,
                name,
                description,
                fields,
            });

            await newContentType.save();

            return sendSuccess(newContentType, 'Content type created successfully', 201);
        } catch (error) {
            console.error('Error creating content type:', error);
            return sendError('Failed to create content type', 500);
        }
    });
}
