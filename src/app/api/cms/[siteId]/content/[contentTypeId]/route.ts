import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContentType, Content, Revision } from "@/lib/cms-models";
import {
    sendSuccess,
    sendError,
    withDB,
    extractSiteId,
    extractContentTypeId,
    generateContentId,
    validateContentData,
    getPaginationParams,
    buildContentQuery,
    triggerWebhooks,
} from "@/lib/cms-utils";

// ============================================================================
// GET - Fetch all content for a content type
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string }> }
) {
    const { siteId, contentTypeId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId) {
            return sendError("siteId and contentTypeId are required", 400);
        }

        try {
            const { limit, skip } = getPaginationParams(request);
            const status = request.nextUrl.searchParams.get("status") || "published";
            const search = request.nextUrl.searchParams.get("q");

            // Build query
            let query: any = buildContentQuery(siteId, contentTypeId, status);

            // Add search functionality
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { data: { $regex: search, $options: "i" } },
                ];
            }

            const content = await Content.find(query)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 });

            const total = await Content.countDocuments(query);

            return sendSuccess({
                content,
                pagination: {
                    total,
                    limit,
                    skip,
                    hasMore: skip + limit < total,
                },
            });
        } catch (error) {
            console.error("Error fetching content:", error);
            return sendError("Failed to fetch content", 500);
        }
    });
}

// ============================================================================
// POST - Create new content
// ============================================================================

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; contentTypeId: string }> }
) {
    const { siteId, contentTypeId } = await params;

    return withDB(async () => {
        if (!siteId || !contentTypeId) {
            return sendError("siteId and contentTypeId are required", 400);
        }

        try {
            const body = await request.json();
            const { title, data, status } = body;

            // Validation
            if (!title) {
                return sendError("title is required", 400);
            }

            if (!data || typeof data !== "object") {
                return sendError("data must be an object", 400);
            }

            // Get content type to validate fields
            const contentType = await ContentType.findOne({ siteId, contentTypeId });

            if (!contentType) {
                return sendError("Content type not found", 404);
            }

            // Validate content data against content type fields
            const validation = validateContentData(data, contentType.fields);
            if (!validation.valid) {
                return sendError(
                    `Validation failed: ${validation.errors.join(", ")}`,
                    400
                );
            }

            // Create new content
            const contentId = generateContentId();
            const newContent = new Content({
                siteId,
                contentTypeId,
                contentId,
                title,
                data,
                status: status || "draft",
                ...(status === "published" && { publishedAt: new Date() }),
            });

            await newContent.save();

            // Create initial revision
            await Revision.create({
                siteId,
                contentId,
                contentTypeId,
                data,
                changedFields: Object.keys(data),
                changedBy: "system",
            });

            // Trigger webhooks if published
            if (status === "published") {
                await triggerWebhooks(siteId, "content.published", {
                    contentTypeId,
                    contentId,
                    title,
                    data,
                });
            }

            return sendSuccess(newContent, "Content created successfully", 201);
        } catch (error) {
            console.error("Error creating content:", error);
            return sendError("Failed to create content", 500);
        }
    });
}
