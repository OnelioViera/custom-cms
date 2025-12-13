import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CmsContentType, Content, Revision } from '@/lib/cms-models';
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
            const contentType = await CmsContentType.findOne({ siteId, contentTypeId });

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

            // Handle draft saving for published content
            // If content is currently published and we're saving as draft,
            // store changes in draftData/draftTitle instead of main fields
            if (content.status === 'published' && status === 'draft') {
                // Save to draft fields, keep published version intact
                if (title !== undefined) content.draftTitle = title;
                if (data !== undefined) content.draftData = data;
                content.hasDraft = true;
                // Keep status as published so it stays on the website

                await content.save();

                // Create revision record for draft
                await Revision.create({
                    siteId,
                    contentId,
                    contentTypeId,
                    data: data || content.draftData,
                    changedFields: ['draft'],
                    changedBy: 'editor',
                });

                return sendSuccess(content, 'Draft saved successfully. Published version unchanged.');
            }

            // If publishing, apply draft changes to main content
            if (status === 'published') {
                // If there's draft data, use it; otherwise use the provided data
                if (content.hasDraft && content.draftData) {
                    content.title = content.draftTitle || title || content.title;
                    content.data = content.draftData;
                } else {
                    if (title !== undefined) content.title = title;
                    if (data !== undefined) content.data = data;
                }

                // Clear draft fields
                content.draftTitle = undefined;
                content.draftData = undefined;
                content.hasDraft = false;
                content.status = 'published';
                content.publishedAt = new Date();

                await content.save();

                // Trigger webhooks
                await triggerWebhooks(siteId, 'content.published', {
                    contentTypeId,
                    contentId,
                    title: content.title,
                    data: content.data,
                });

                return sendSuccess(content, 'Content published successfully');
            }

            // For non-published content (new drafts), update normally
            if (title !== undefined) content.title = title;
            if (data !== undefined) content.data = data;
            if (status !== undefined) {
                content.status = status;
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

            // Trigger webhooks for archived content
            if (status === 'archived') {
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
