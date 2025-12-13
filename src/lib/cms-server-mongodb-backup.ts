// Server-side CMS data access using Vercel Postgres
// This replaces the MongoDB implementation

import { db } from './db';
import { content, contentTypes, formSubmissions, users, media } from './db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cache } from './cache';
import { nanoid } from 'nanoid';

const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

// ============================================================================
// CONTENT OPERATIONS (Server-side)
// ============================================================================

export async function getContentServer(contentTypeId: string, status: string = 'published') {
    try {
        const query = status && status !== 'all'
            ? and(
                eq(content.siteId, SITE_ID),
                eq(content.contentTypeId, contentTypeId),
                eq(content.status, status)
            )
            : and(
                eq(content.siteId, SITE_ID),
                eq(content.contentTypeId, contentTypeId)
            );

        const results = await db
            .select()
            .from(content)
            .where(query)
            .orderBy(desc(content.createdAt));

        return results.map(row => ({
            _id: row.id.toString(),
            contentId: row.contentId,
            title: row.title,
            data: row.data as any,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    } catch (error: any) {
        if (error?.name !== 'PostgresError') {
            console.error(`Error fetching ${contentTypeId}:`, error?.message || error);
        }
        return [];
    }
}

export async function getContentByIdServer(contentTypeId: string, contentId: string) {
    try {
        const results = await db
            .select()
            .from(content)
            .where(
                and(
                    eq(content.siteId, SITE_ID),
                    eq(content.contentTypeId, contentTypeId),
                    eq(content.contentId, contentId)
                )
            )
            .limit(1);

        if (results.length === 0) return null;

        const row = results[0];
        return {
            _id: row.id.toString(),
            contentId: row.contentId,
            title: row.title,
            data: row.data as any,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    } catch (error: any) {
        console.error('Error fetching content:', error?.message || error);
        return null;
    }
}

export async function searchContentServer(contentTypeId: string, query: string, status: string = 'published') {
    try {
        const searchCondition = status && status !== 'all'
            ? and(
                eq(content.siteId, SITE_ID),
                eq(content.contentTypeId, contentTypeId),
                eq(content.status, status),
                sql`${content.title} ILIKE ${`%${query}%`}`
            )
            : and(
                eq(content.siteId, SITE_ID),
                eq(content.contentTypeId, contentTypeId),
                sql`${content.title} ILIKE ${`%${query}%`}`
            );

        const results = await db
            .select()
            .from(content)
            .where(searchCondition)
            .orderBy(desc(content.createdAt));

        return results.map(row => ({
            _id: row.id.toString(),
            contentId: row.contentId,
            title: row.title,
            data: row.data as any,
            status: row.status,
        }));
    } catch (error: any) {
        console.error('Error searching content:', error?.message || error);
        return [];
    }
}

// ============================================================================
// SITE CONTENT (Server-side)
// ============================================================================

export async function getSiteContentServer() {
    // Check cache first
    const cacheKey = `site-content:${SITE_ID}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        const results = await db
            .select()
            .from(content)
            .where(
                and(
                    eq(content.siteId, SITE_ID),
                    eq(content.contentTypeId, 'site-content'),
                    eq(content.status, 'published')
                )
            )
            .orderBy(desc(content.updatedAt))
            .limit(1);

        if (results.length === 0) {
            // Return default values if no content exists
            return {
                heroTitle: 'Premium Precast Concrete Solutions for Infrastructure',
                heroSubtitle: 'Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.',
                heroDescription: 'Serving solar farms, battery storage facilities, and utility systems across North America.',
                heroImage: '',
                heroButtons: [
                    { id: 'btn_1', text: 'Start a Project', link: '#contact', isExternal: false, bgColor: '#ca8a04', textColor: '#ffffff', style: 'filled' },
                    { id: 'btn_2', text: 'View Projects', link: '/projects', isExternal: false, bgColor: '#111827', textColor: '#111827', style: 'outline' },
                ],
                stats: [
                    { id: 'stat_1', value: '500+', label: 'Projects Completed' },
                    { id: 'stat_2', value: '50K+', label: 'Cubic Yards Produced' },
                    { id: 'stat_3', value: '25+', label: 'Years Experience' },
                    { id: 'stat_4', value: '99.8%', label: 'On-Time Delivery' },
                ],
                projectsTitle: 'Featured Projects',
                projectsSubtitle: 'Recent infrastructure solutions delivering impact across North America',
                testimonialsTitle: 'Client Testimonials',
                testimonialsSubtitle: 'Trusted by leading companies',
                contactTitle: 'Get in Touch',
                contactSubtitle: "Have a project in mind? Let's discuss how we can deliver precision-engineered solutions.",
                ctaTitle: 'Ready for Your Project?',
                ctaSubtitle: "Let's discuss how Lindsay Precast can deliver precision-engineered solutions",
            };
        }

        // Merge with defaults to ensure all fields exist
        const defaults = {
            heroTitle: 'Premium Precast Concrete Solutions for Infrastructure',
            heroSubtitle: 'Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.',
            heroDescription: 'Serving solar farms, battery storage facilities, and utility systems across North America.',
            heroImage: '',
            heroButtons: [
                { id: 'btn_1', text: 'Start a Project', link: '#contact', isExternal: false, bgColor: '#ca8a04', textColor: '#ffffff', style: 'filled' },
                { id: 'btn_2', text: 'View Projects', link: '/projects', isExternal: false, bgColor: '#111827', textColor: '#111827', style: 'outline' },
            ],
            stats: [
                { id: 'stat_1', value: '500+', label: 'Projects Completed' },
                { id: 'stat_2', value: '50K+', label: 'Cubic Yards Produced' },
                { id: 'stat_3', value: '25+', label: 'Years Experience' },
                { id: 'stat_4', value: '99.8%', label: 'On-Time Delivery' },
            ],
            projectsTitle: 'Featured Projects',
            projectsSubtitle: 'Recent infrastructure solutions delivering impact across North America',
            testimonialsTitle: 'Client Testimonials',
            testimonialsSubtitle: 'Trusted by leading companies',
            contactTitle: 'Get in Touch',
            contactSubtitle: "Have a project in mind? Let's discuss how we can deliver precision-engineered solutions.",
            ctaTitle: 'Ready for Your Project?',
            ctaSubtitle: "Let's discuss how Lindsay Precast can deliver precision-engineered solutions",
        };

        const result = { ...defaults, ...(results[0].data as any) };
        cache.set(cacheKey, result, 60000); // Cache for 60 seconds
        return result;
    } catch (error: any) {
        console.error('Error fetching site content:', error?.message || error);
        return null;
    }
}

// ============================================================================
// CONTENT TYPES (Server-side)
// ============================================================================

export async function getContentTypesServer() {
    try {
        const results = await db
            .select()
            .from(contentTypes)
            .where(eq(contentTypes.siteId, SITE_ID))
            .orderBy(desc(contentTypes.createdAt));

        return results.map(row => ({
            _id: row.id.toString(),
            contentTypeId: row.contentTypeId,
            name: row.name,
            description: row.description,
            fields: row.fields as any,
        }));
    } catch (error: any) {
        console.error('Error fetching content types:', error?.message || error);
        return [];
    }
}

export async function getContentTypeByIdServer(contentTypeId: string) {
    try {
        const results = await db
            .select()
            .from(contentTypes)
            .where(
                and(
                    eq(contentTypes.siteId, SITE_ID),
                    eq(contentTypes.contentTypeId, contentTypeId)
                )
            )
            .limit(1);

        if (results.length === 0) return null;

        const row = results[0];
        return {
            _id: row.id.toString(),
            contentTypeId: row.contentTypeId,
            name: row.name,
            description: row.description,
            fields: row.fields as any,
        };
    } catch (error: any) {
        console.error('Error fetching content type:', error?.message || error);
        return null;
    }
}

// ============================================================================
// FORM SUBMISSIONS (Server-side)
// ============================================================================

export async function getFormSubmissionsServer(status?: string) {
    try {
        const query = status
            ? and(
                eq(formSubmissions.siteId, SITE_ID),
                eq(formSubmissions.status, status)
            )
            : eq(formSubmissions.siteId, SITE_ID);

        const results = await db
            .select()
            .from(formSubmissions)
            .where(query)
            .orderBy(desc(formSubmissions.createdAt));

        return results.map(row => ({
            _id: row.id.toString(),
            submissionId: row.submissionId,
            formType: row.formType,
            data: row.data as any,
            status: row.status,
            createdAt: row.createdAt,
        }));
    } catch (error: any) {
        console.error('Error fetching form submissions:', error?.message || error);
        return [];
    }
}
