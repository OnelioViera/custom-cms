import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContentType, Content, Revision } from '@/lib/cms-models';
import {
    sendSuccess,
    sendError,
    withDB,
    validateContentData,
    getChangedFields,
    triggerWebhooks
} from '@/lib/cms-utils';

// ============================================================================
// GET - Fetch a specific content item
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string; contentId: string }> }
) {
    const { siteId, contentTypeId, contentId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId || !contentId) {
            return sendError('siteId, contentTypeId, and contentId are required', 400);
        }

        try {
            const content = await Content.findOne({
                siteId,
                contentTypeId,
                contentId,
            });

            if (!content) {
                return sendError('Content not found', 404);
            }

            return sendSuccess(content);
        } catch (error) {
            console.error('Error fetching content:', error);
            return sendError('Failed to fetch content', 500);
        }
    });
}

// ============================================================================
// PUT - Update content
// ============================================================================

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string; contentId: string }> }
) {
    const { siteId, contentTypeId, contentId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId || !contentId) {
            return sendError('siteId, contentTypeId, and contentId are required', 400);
        }

        try {
            const body = await request.json();
            const { title, data, status } = body;

            // Find existing content
            const content = await Content.findOne({
                siteId,
                contentTypeId,
                contentId,
            });

            if (!content) {
                return sendError('Content not found', 404);
            }

            // Get content type for validation
            const contentType = await ContentType.findOne({ siteId, contentTypeId });

            if (!contentType) {
                return sendError('Content type not found', 404);
            }

            // Validate new data if provided
            if (data) {
                const validation = validateContentData(data, contentType.fields);
                if (!validation.valid) {
                    return sendError(`Validation failed: ${validation.errors.join(', ')}`, 400);
                }
            }

            // Store old data for revision tracking
            const oldData = content.data;

            // Update content
            if (title !== undefined) content.title = title;
            if (data !== undefined) content.data = data;
            if (status !== undefined) {
                content.status = status;
                if (status === 'published') {
                    content.publishedAt = new Date();
                }
            }

            await content.save();

            // Create revision record
            const changedFields = data ? getChangedFields(oldData, data) : [];
            if (title !== undefined) changedFields.push('title');
            if (status !== undefined) changedFields.push('status');

            await Revision.create({
                siteId,
                contentId,
                contentTypeId,
                data: content.data,
                changedFields,
                changedBy: 'editor',
            });

            // Trigger webhooks
            if (status === 'published') {
                await triggerWebhooks(siteId, 'content.published', {
                    contentTypeId,
                    contentId,
                    title: content.title,
                    data: content.data,
                });
            } else if (status === 'archived') {
                await triggerWebhooks(siteId, 'content.archived', {
                    contentTypeId,
                    contentId,
                });
            }

            return sendSuccess(content, 'Content updated successfully');
        } catch (error) {
            console.error('Error updating content:', error);
            return sendError('Failed to update content', 500);
        }
    });
}

// ============================================================================
// DELETE - Delete content
// ============================================================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string; contentId: string }> }
) {
    const { siteId, contentTypeId, contentId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId || !contentId) {
            return sendError('siteId, contentTypeId, and contentId are required', 400);
        }

        try {
            const content = await Content.findOneAndDelete({
                siteId,
                contentTypeId,
                contentId,
            });

            if (!content) {
                return sendError('Content not found', 404);
            }

            // Delete related revisions
            await Revision.deleteMany({ siteId, contentId });

            // Trigger webhook
            await triggerWebhooks(siteId, 'content.deleted', {
                contentTypeId,
                contentId,
            });

            return sendSuccess(
                { deletedId: contentId },
                'Content deleted successfully'
            );
        } catch (error) {
            console.error('Error deleting content:', error);
            return sendError('Failed to delete content', 500);
        }
    });
}
