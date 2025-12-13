import { NextRequest, NextResponse } from 'next/server';
import { Media } from '@/lib/cms-models';
import { sendSuccess, sendError, withDB } from '@/lib/cms-utils';

// ============================================================================
// GET - Get single media item
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; mediaId: string }> }
) {
    const { siteId, mediaId } = await params;

    return withDB(async () => {
        if (!siteId || !mediaId) {
            return sendError('siteId and mediaId are required', 400);
        }

        try {
            const media = await Media.findOne({ siteId, mediaId }).lean();

            if (!media) {
                return sendError('Media not found', 404);
            }

            return sendSuccess(media);
        } catch (error) {
            console.error('Error fetching media:', error);
            return sendError('Failed to fetch media', 500);
        }
    });
}

// ============================================================================
// PUT - Update media metadata
// ============================================================================

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; mediaId: string }> }
) {
    const { siteId, mediaId } = await params;

    return withDB(async () => {
        if (!siteId || !mediaId) {
            return sendError('siteId and mediaId are required', 400);
        }

        try {
            const body = await request.json();
            const { name, folder, tags, alt, description, metadata } = body;

            const media = await Media.findOne({ siteId, mediaId });

            if (!media) {
                return sendError('Media not found', 404);
            }

            // Update allowed fields
            if (name !== undefined) media.name = name;
            if (folder !== undefined) media.folder = folder;
            if (tags !== undefined) media.tags = tags;
            if (alt !== undefined) media.alt = alt;
            if (description !== undefined) media.description = description;
            if (metadata !== undefined) media.metadata = { ...media.metadata, ...metadata };

            await media.save();

            return sendSuccess(media, 'Media updated successfully');
        } catch (error) {
            console.error('Error updating media:', error);
            return sendError('Failed to update media', 500);
        }
    });
}

// ============================================================================
// DELETE - Delete media
// ============================================================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; mediaId: string }> }
) {
    const { siteId, mediaId } = await params;

    return withDB(async () => {
        if (!siteId || !mediaId) {
            return sendError('siteId and mediaId are required', 400);
        }

        try {
            const media = await Media.findOneAndDelete({ siteId, mediaId });

            if (!media) {
                return sendError('Media not found', 404);
            }

            return sendSuccess({ mediaId }, 'Media deleted successfully');
        } catch (error) {
            console.error('Error deleting media:', error);
            return sendError('Failed to delete media', 500);
        }
    });
}

