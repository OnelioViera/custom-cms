import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContentType } from "@/lib/cms-models";
import {
    sendSuccess,
    sendError,
    withDB,
} from "@/lib/cms-utils";

// ============================================================================
// POST - Add a new field to a content type
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
            const {
                fieldId,
                name,
                type,
                required,
                minLength,
                maxLength,
                pattern,
                options,
            } = body;

            // Validation
            if (!fieldId || !name || !type) {
                return sendError("fieldId, name, and type are required", 400);
            }

            const validTypes = [
                "text",
                "number",
                "email",
                "url",
                "date",
                "select",
                "boolean",
                "textarea",
            ];
            if (!validTypes.includes(type)) {
                return sendError(`type must be one of: ${validTypes.join(", ")}`, 400);
            }

            // Find the content type
            const contentType = await ContentType.findOne({ siteId, contentTypeId });

            if (!contentType) {
                return sendError("Content type not found", 404);
            }

            // Check if field already exists
            if (contentType.fields.some((f: any) => f.fieldId === fieldId)) {
                return sendError("Field with this ID already exists", 409);
            }

            // Create new field object
            const newField = {
                fieldId,
                name,
                type,
                required: required || false,
                ...(minLength !== undefined && { minLength }),
                ...(maxLength !== undefined && { maxLength }),
                ...(pattern && { pattern }),
                ...(options && { options }),
            };

            // Add field to content type
            contentType.fields.push(newField);
            await contentType.save();

            return sendSuccess(
                { field: newField, contentType },
                "Field added successfully",
                201
            );
        } catch (error) {
            console.error("Error adding field:", error);
            return sendError("Failed to add field", 500);
        }
    });
}
