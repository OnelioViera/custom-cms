// Server-side CMS data access - use this in Server Components
// This directly queries the database instead of making HTTP requests

import { connectDB } from './mongodb';
import { Content, ContentType, FormSubmission } from './cms-models';

const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

// ============================================================================
// CONTENT OPERATIONS (Server-side)
// ============================================================================

export async function getContentServer(contentTypeId: string, status: string = 'published') {
    try {
        await connectDB();
        
        const query: any = { siteId: SITE_ID, contentTypeId };
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const content = await Content.find(query)
            .sort({ createdAt: -1 })
            .lean();
        
        return content;
    } catch (error) {
        console.error(`Error fetching ${contentTypeId}:`, error);
        return [];
    }
}

export async function getContentByIdServer(contentTypeId: string, contentId: string) {
    try {
        await connectDB();
        
        const content = await Content.findOne({
            siteId: SITE_ID,
            contentTypeId,
            contentId,
        }).lean();
        
        return content;
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

export async function searchContentServer(contentTypeId: string, query: string, status: string = 'published') {
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
    try {
        await connectDB();
        
        const contentTypes = await ContentType.find({ siteId: SITE_ID })
            .sort({ createdAt: -1 })
            .lean();
        
        return contentTypes;
    } catch (error) {
        console.error('Error fetching content types:', error);
        return [];
    }
}

export async function getContentTypeByIdServer(contentTypeId: string) {
    try {
        await connectDB();
        
        const contentType = await ContentType.findOne({
            siteId: SITE_ID,
            contentTypeId,
        }).lean();
        
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
        
        return { ...defaults, ...content.data };
    } catch (error) {
        console.error('Error fetching site content:', error);
        return null;
    }
}

// ============================================================================
// FORM SUBMISSIONS (Server-side)
// ============================================================================

export async function getFormSubmissionsServer(status?: string) {
    try {
        await connectDB();
        
        const query: any = { siteId: SITE_ID };
        if (status) {
            query.status = status;
        }
        
        const submissions = await FormSubmission.find(query)
            .sort({ createdAt: -1 })
            .lean();
        
        return submissions;
    } catch (error) {
        console.error('Error fetching form submissions:', error);
        return [];
    }
}

