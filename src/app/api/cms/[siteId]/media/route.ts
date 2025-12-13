import { NextRequest, NextResponse } from 'next/server';
import { Media } from '@/lib/cms-models';
import { sendSuccess, sendError, withDB } from '@/lib/cms-utils';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// GET - List all media for a site
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
            const { searchParams } = new URL(request.url);
            const type = searchParams.get('type'); // 'video' or 'image'
            const folder = searchParams.get('folder');
            const tag = searchParams.get('tag');
            const search = searchParams.get('search');
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '50');

            // Build query
            const query: any = { siteId };

            if (type) {
                query.type = type;
            }

            if (folder) {
                query.folder = folder;
            }

            if (tag) {
                query.tags = tag;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { originalName: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            // Get total count
            const total = await Media.countDocuments(query);

            // Get paginated results
            const media = await Media.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return sendSuccess({
                media,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error('Error fetching media:', error);
            return sendError('Failed to fetch media', 500);
        }
    });
}

// ============================================================================
// POST - Upload new media
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
            const {
                name,
                originalName,
                type,
                mimeType,
                size,
                url,
                thumbnailUrl,
                metadata,
                folder,
                tags,
                alt,
                description,
            } = body;

            // Validate required fields
            if (!name || !originalName || !type || !mimeType || !url) {
                return sendError('Missing required fields: name, originalName, type, mimeType, url', 400);
            }

            // Validate type
            if (!['video', 'image'].includes(type)) {
                return sendError('Invalid type. Must be "video" or "image"', 400);
            }

            // Generate unique mediaId
            const mediaId = `media_${uuidv4()}`;

            // Create media entry
            const media = await Media.create({
                siteId,
                mediaId,
                name,
                originalName,
                type,
                mimeType,
                size: size || 0,
                url,
                thumbnailUrl,
                metadata: metadata || {},
                folder: folder || 'root',
                tags: tags || [],
                alt: alt || '',
                description: description || '',
            });

            return sendSuccess(media, 'Media uploaded successfully');
        } catch (error) {
            console.error('Error uploading media:', error);
            return sendError('Failed to upload media', 500);
        }
    });
}

