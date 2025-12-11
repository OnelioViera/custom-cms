import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { FormSubmission } from '@/lib/cms-models';
import {
    sendSuccess,
    sendError,
    withDB,
    triggerWebhooks
} from '@/lib/cms-utils';

// ============================================================================
// POST - Update status for multiple submissions
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
            const { submissionIds, status } = body;

            // Validation
            if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
                return sendError('submissionIds must be a non-empty array', 400);
            }

            if (!status) {
                return sendError('status is required', 400);
            }

            const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
            if (!validStatuses.includes(status)) {
                return sendError(
                    `status must be one of: ${validStatuses.join(', ')}`,
                    400
                );
            }

            // Update all submissions
            const result = await FormSubmission.updateMany(
                {
                    siteId,
                    _id: { $in: submissionIds },
                },
                { status }
            );

            // Trigger webhook
            await triggerWebhooks(siteId, 'form.bulk_status_updated', {
                count: result.modifiedCount,
                newStatus: status,
                submissionIds,
            });

            return sendSuccess(
                { modifiedCount: result.modifiedCount, status },
                `Updated ${result.modifiedCount} form submissions`
            );
        } catch (error) {
            console.error('Error bulk updating form submissions:', error);
            return sendError('Failed to update form submissions', 500);
        }
    });
}
