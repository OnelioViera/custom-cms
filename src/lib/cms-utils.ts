import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { Content, ContentType, Webhook, WebhookLog } from './cms-models';
import { ContentTypeField } from '@/types/cms';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function sendError(message: string, statusCode: number = 400) {
    return NextResponse.json({ success: false, error: message }, { status: statusCode });
}

export function sendSuccess(data: any, message?: string, statusCode: number = 200) {
    return NextResponse.json(
        { success: true, data, message },
        { status: statusCode }
    );
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

export async function withDB(callback: () => Promise<NextResponse>) {
    try {
        await connectDB();
        return await callback();
    } catch (error) {
        console.error('Database error:', error);
        return sendError('Database connection failed', 500);
    }
}

// ============================================================================
// AUTHENTICATION & JWT
// ============================================================================

import { getJwtSecret } from './env';

export function generateToken(userId: string, siteId: string): string {
    return jwt.sign(
        { userId, siteId },
        getJwtSecret(),
        { expiresIn: '7d' }
    );
}

export function verifyToken(token: string): { userId: string; siteId: string } | null {
    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as { userId: string; siteId: string };
        return { userId: decoded.userId, siteId: decoded.siteId };
    } catch {
        return null;
    }
}

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

// ============================================================================
// REQUEST VALIDATION & PARSING
// ============================================================================

export async function parseAuthToken(request: NextRequest): Promise<{ userId: string; siteId: string } | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
}

export function extractSiteId(params: any): string {
    return params.siteId || '';
}

export function extractContentTypeId(params: any): string {
    return params.contentTypeId || '';
}

export function extractContentId(params: any): string {
    return params.contentId || '';
}

// ============================================================================
// ID GENERATION
// ============================================================================

export function generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateContentTypeId(): string {
    return `type_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// CONTENT VALIDATION
// ============================================================================

export function validateContentData(
    data: Record<string, any>,
    fields: ContentTypeField[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const field of fields) {
        const value = data[field.name];

        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field.name} is required`);
            continue;
        }

        if (value === undefined || value === null || value === '') {
            continue; // Optional field is empty, skip validation
        }

        // Type validation
        switch (field.type) {
            case 'email':
                if (!isValidEmail(value)) {
                    errors.push(`${field.name} is not a valid email`);
                }
                break;

            case 'url':
                if (!isValidUrl(value)) {
                    errors.push(`${field.name} is not a valid URL`);
                }
                break;

            case 'number':
                if (isNaN(Number(value))) {
                    errors.push(`${field.name} must be a number`);
                }
                break;

            case 'date':
                if (isNaN(Date.parse(value))) {
                    errors.push(`${field.name} is not a valid date`);
                }
                break;

            case 'text':
            case 'textarea':
                if (typeof value !== 'string') {
                    errors.push(`${field.name} must be text`);
                }
                if (field.minLength && value.length < field.minLength) {
                    errors.push(`${field.name} must be at least ${field.minLength} characters`);
                }
                if (field.maxLength && value.length > field.maxLength) {
                    errors.push(`${field.name} must be at most ${field.maxLength} characters`);
                }
                if (field.pattern && !new RegExp(field.pattern).test(value)) {
                    errors.push(`${field.name} format is invalid`);
                }
                break;

            case 'select':
                if (field.options && !field.options.includes(value)) {
                    errors.push(`${field.name} must be one of: ${field.options.join(', ')}`);
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`${field.name} must be true or false`);
                }
                break;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// CONTENT OPERATIONS
// ============================================================================

export function getChangedFields(oldData: any, newData: any): string[] {
    const changed: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            changed.push(key);
        }
    }

    return changed;
}

// ============================================================================
// WEBHOOK MANAGEMENT
// ============================================================================

export async function triggerWebhooks(
    siteId: string,
    event: string,
    payload: any
): Promise<void> {
    try {
        const webhooks = await Webhook.find({
            siteId,
            active: true,
            events: event,
        });

        for (const webhook of webhooks) {
            try {
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Event': event,
                        'X-Site-ID': siteId,
                    },
                    body: JSON.stringify(payload),
                });

                await WebhookLog.create({
                    siteId,
                    webhookId: webhook._id,
                    event,
                    statusCode: response.status,
                    response: await response.text(),
                });
            } catch (error) {
                await WebhookLog.create({
                    siteId,
                    webhookId: webhook._id,
                    event,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
    } catch (error) {
        console.error('Error triggering webhooks:', error);
    }
}

// ============================================================================
// PAGINATION
// ============================================================================

export function getPaginationParams(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    return { limit, skip };
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

export function buildContentQuery(siteId: string, contentTypeId: string, status?: string) {
    const query: any = { siteId, contentTypeId };
    if (status && status !== 'all') {
        query.status = status;
    }
    return query;
}
