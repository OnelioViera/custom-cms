// Server-side CMS data access using MongoDB (Mongoose)
import { connectDB } from './mongodb';
import { Content, CmsContentType, FormSubmission, User, Media } from './cms-models';
import { nanoid } from 'nanoid';
import { getSiteId } from './env';

const SITE_ID = getSiteId();

// ============================================================================
// CACHING FOR DEVELOPMENT
// ============================================================================

interface CacheEntry {
    data: any;
    timestamp: number;
}

const isDev = process.env.NODE_ENV === 'development';
const CACHE_TTL = 10000; // 10 seconds in development
const cache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
    if (!isDev) return null;

    const entry = cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCache(key: string, data: any): void {
    if (!isDev) return;
    cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// CONTENT OPERATIONS (Server-side)
// ============================================================================

export async function getContentServer(contentTypeId: string, status: string = 'published') {
    const cacheKey = `content:${contentTypeId}:${status}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const query: any = { siteId: SITE_ID, contentTypeId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const content = await Content.find(query)
            .sort({ createdAt: -1 })
            .lean();

        setCache(cacheKey, content);
        return content;
    } catch (error) {
        console.error(`Error fetching ${contentTypeId}:`, error);
        return [];
    }
}

export async function getContentByIdServer(contentTypeId: string, contentId: string) {
    const cacheKey = `content:${contentTypeId}:${contentId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const content = await Content.findOne({
            siteId: SITE_ID,
            contentTypeId,
            contentId,
        }).lean();

        setCache(cacheKey, content);
        return content;
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

export async function searchContentServer(contentTypeId: string, query: string, status: string = 'published') {
    const cacheKey = `search:${contentTypeId}:${query}:${status}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const searchQuery: any = {
            siteId: SITE_ID,
            contentTypeId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
            ],
        };

        if (status && status !== 'all') {
            searchQuery.status = status;
        }

        const content = await Content.find(searchQuery)
            .sort({ createdAt: -1 })
            .lean();

        setCache(cacheKey, content);
        return content;
    } catch (error) {
        console.error('Error searching content:', error);
        return [];
    }
}

// ============================================================================
// CONTENT TYPES (Server-side)
// ============================================================================

export async function getContentTypesServer() {
    const cacheKey = 'contenttypes:all';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const contentTypes = await CmsContentType.find({ siteId: SITE_ID })
            .sort({ createdAt: -1 })
            .lean();

        setCache(cacheKey, contentTypes);
        return contentTypes;
    } catch (error) {
        console.error('Error fetching content types:', error);
        return [];
    }
}

export async function getContentTypeByIdServer(contentTypeId: string) {
    const cacheKey = `contenttype:${contentTypeId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const contentType = await CmsContentType.findOne({
            siteId: SITE_ID,
            contentTypeId,
        }).lean();

        setCache(cacheKey, contentType);
        return contentType;
    } catch (error) {
        console.error('Error fetching content type:', error);
        return null;
    }
}

// ============================================================================
// SITE CONTENT (Server-side)
// ============================================================================

export async function getSiteContentServer() {
    const cacheKey = 'sitecontent';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        // Get the first (and should be only) site content item
        const content = await Content.findOne({
            siteId: SITE_ID,
            contentTypeId: 'site-content',
            status: 'published',
        }).lean();

        if (!content) {
            // Return default values if no content exists
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
            setCache(cacheKey, defaults);
            return defaults;
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

        const result = { ...defaults, ...content.data };
        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching site content:', error);
        return null;
    }
}

// ============================================================================
// FORM SUBMISSIONS (Server-side)
// ============================================================================

export async function getFormSubmissionsServer(status?: string) {
    const cacheKey = `submissions:${status || 'all'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        await connectDB();

        const query: any = { siteId: SITE_ID };
        if (status) {
            query.status = status;
        }

        const submissions = await FormSubmission.find(query)
            .sort({ createdAt: -1 })
            .lean();

        setCache(cacheKey, submissions);
        return submissions;
    } catch (error) {
        console.error('Error fetching form submissions:', error);
        return [];
    }
}

