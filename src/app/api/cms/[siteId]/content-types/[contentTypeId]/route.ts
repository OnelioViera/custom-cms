import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContentType } from '@/lib/cms-models';
import {
    sendSuccess,
    sendError,
    withDB
} from '@/lib/cms-utils';

// ============================================================================
// GET - Fetch a specific content type
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string }> }
) {
    const { siteId, contentTypeId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId) {
            return sendError('siteId and contentTypeId are required', 400);
        }

        try {
            const contentType = await ContentType.findOne({ siteId, contentTypeId });

            if (!contentType) {
                return sendError('Content type not found', 404);
            }

            return sendSuccess(contentType);
        } catch (error) {
            console.error('Error fetching content type:', error);
            return sendError('Failed to fetch content type', 500);
        }
    });
}

// ============================================================================
// PUT - Update a content type
// ============================================================================

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string }> }
) {
    const { siteId, contentTypeId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId) {
            return sendError('siteId and contentTypeId are required', 400);
        }

        try {
            const body = await request.json();
            const { name, description, fields } = body;

            // Validation
            if (name && typeof name !== 'string') {
                return sendError('name must be a string', 400);
            }

            if (fields && !Array.isArray(fields)) {
                return sendError('fields must be an array', 400);
            }

            if (fields && fields.length === 0) {
                return sendError('fields must not be empty', 400);
            }

            // Find and update content type
            const contentType = await ContentType.findOneAndUpdate(
                { siteId, contentTypeId },
                {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(fields && { fields }),
                },
                { new: true, runValidators: true }
            );

            if (!contentType) {
                return sendError('Content type not found', 404);
            }

            return sendSuccess(contentType, 'Content type updated successfully');
        } catch (error) {
            console.error('Error updating content type:', error);
            return sendError('Failed to update content type', 500);
        }
    });
}

// ============================================================================
// DELETE - Delete a content type
// ============================================================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string }> }
) {
    const { siteId, contentTypeId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId) {
            return sendError('siteId and contentTypeId are required', 400);
        }

        try {
            const contentType = await ContentType.findOneAndDelete({
                siteId,
                contentTypeId,
            });

            if (!contentType) {
                return sendError('Content type not found', 404);
            }

            return sendSuccess(
                { deletedId: contentTypeId },
                'Content type deleted successfully'
            );
        } catch (error) {
            console.error('Error deleting content type:', error);
            return sendError('Failed to delete content type', 500);
        }
    });
}
