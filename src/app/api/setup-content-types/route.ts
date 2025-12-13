import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { contentTypes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendSuccess, sendError } from '@/lib/cms-utils';

const SITE_ID = 'lindsayprecast';

export async function GET(request: NextRequest) {
    try {
        console.log('Setting up content types...\n');

        const types = [
            {
                contentTypeId: 'projects',
                name: 'Projects',
                description: 'Construction projects portfolio',
                fields: [
                    { name: 'title', type: 'text', label: 'Project Title', required: true },
                    { name: 'description', type: 'richtext', label: 'Description', required: true },
                    { name: 'location', type: 'text', label: 'Location', required: true },
                    { name: 'completionDate', type: 'date', label: 'Completion Date', required: false },
                    { name: 'images', type: 'media', label: 'Project Images', required: false, multiple: true },
                    { name: 'featured', type: 'boolean', label: 'Featured Project', required: false },
                ]
            },
            {
                contentTypeId: 'testimonials',
                name: 'Testimonials',
                description: 'Client testimonials and reviews',
                fields: [
                    { name: 'clientName', type: 'text', label: 'Client Name', required: true },
                    { name: 'company', type: 'text', label: 'Company', required: false },
                    { name: 'testimonial', type: 'richtext', label: 'Testimonial', required: true },
                    { name: 'rating', type: 'number', label: 'Rating (1-5)', required: false },
                    { name: 'photo', type: 'media', label: 'Client Photo', required: false },
                    { name: 'featured', type: 'boolean', label: 'Featured', required: false },
                ]
            },
            {
                contentTypeId: 'team',
                name: 'Team Members',
                description: 'Team member profiles',
                fields: [
                    { name: 'name', type: 'text', label: 'Full Name', required: true },
                    { name: 'position', type: 'text', label: 'Position', required: true },
                    { name: 'bio', type: 'richtext', label: 'Biography', required: false },
                    { name: 'photo', type: 'media', label: 'Profile Photo', required: false },
                    { name: 'email', type: 'email', label: 'Email', required: false },
                    { name: 'phone', type: 'text', label: 'Phone', required: false },
                ]
            },
            {
                contentTypeId: 'site-content',
                name: 'Site Content',
                description: 'General website content sections',
                fields: [
                    { name: 'sectionId', type: 'text', label: 'Section ID', required: true },
                    { name: 'title', type: 'text', label: 'Section Title', required: true },
                    { name: 'content', type: 'richtext', label: 'Content', required: true },
                    { name: 'image', type: 'media', label: 'Section Image', required: false },
                ]
            }
        ];

        const results = [];

        for (const type of types) {
            // Check if content type already exists
            const existing = await db
                .select()
                .from(contentTypes)
                .where(
                    and(
                        eq(contentTypes.siteId, SITE_ID),
                        eq(contentTypes.contentTypeId, type.contentTypeId)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                console.log(`✓ Content type "${type.name}" already exists`);
                results.push({ name: type.name, status: 'exists' });
                continue;
            }

            // Create content type
            await db.insert(contentTypes).values({
                siteId: SITE_ID,
                contentTypeId: type.contentTypeId,
                name: type.name,
                description: type.description,
                fields: type.fields,
            });

            console.log(`✅ Created content type: ${type.name}`);
            results.push({ name: type.name, status: 'created' });
        }

        return sendSuccess({
            message: 'Content types setup complete!',
            results
        });

    } catch (error) {
        console.error('❌ Error setting up content types:', error);
        return sendError('Failed to setup content types: ' + (error instanceof Error ? error.message : 'Unknown error'), 500);
    }
}
