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
// GET - Fetch a specific form submission
// ============================================================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
    const { siteId, submissionId } = await params;

    return withDB(async () => {
        if (!siteId || !submissionId) {
            return sendError('siteId and submissionId are required', 400);
        }

        try {
            const submission = await FormSubmission.findOne({
                siteId,
                _id: submissionId,
            });

            if (!submission) {
                return sendError('Form submission not found', 404);
            }

            return sendSuccess(submission);
        } catch (error) {
            console.error('Error fetching form submission:', error);
            return sendError('Failed to fetch form submission', 500);
        }
    });
}

// ============================================================================
// PUT - Update form submission status
// ============================================================================

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
    const { siteId, submissionId } = await params;

    return withDB(async () => {
        if (!siteId || !submissionId) {
            return sendError('siteId and submissionId are required', 400);
        }

        try {
            const body = await request.json();
            const { status } = body;

            // Validation
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

            // Find and update submission
            const submission = await FormSubmission.findOneAndUpdate(
                { siteId, _id: submissionId },
                { status },
                { new: true, runValidators: true }
            );

            if (!submission) {
                return sendError('Form submission not found', 404);
            }

            // Trigger webhook for status change
            await triggerWebhooks(siteId, 'form.status_updated', {
                submissionId: submission._id,
                title: submission.title,
                newStatus: status,
                email: submission.data.email,
            });

            return sendSuccess(
                submission,
                `Form submission status updated to ${status}`
            );
        } catch (error) {
            console.error('Error updating form submission:', error);
            return sendError('Failed to update form submission', 500);
        }
    });
}

// ============================================================================
// DELETE - Delete a form submission
// ============================================================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
    const { siteId, submissionId } = await params;

    return withDB(async () => {
        if (!siteId || !submissionId) {
            return sendError('siteId and submissionId are required', 400);
        }

        try {
            const submission = await FormSubmission.findOneAndDelete({
                siteId,
                _id: submissionId,
            });

            if (!submission) {
                return sendError('Form submission not found', 404);
            }

            // Trigger webhook for deletion
            await triggerWebhooks(siteId, 'form.deleted', {
                submissionId: submission._id,
                title: submission.title,
                email: submission.data.email,
            });

            return sendSuccess(
                { deletedId: submissionId },
                'Form submission deleted successfully'
            );
        } catch (error) {
            console.error('Error deleting form submission:', error);
            return sendError('Failed to delete form submission', 500);
        }
    });
}
