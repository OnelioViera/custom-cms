// API client for consuming CMS endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    return response.json();
}

// ============================================================================
// CONTENT OPERATIONS
// ============================================================================

export async function getContent(contentTypeId: string, status: string = 'published') {
    try {
        const response = await fetchAPI(
            `/cms/${SITE_ID}/content/${contentTypeId}?status=${status}`
        );
        return response.data?.content || [];
    } catch (error) {
        console.error(`Error fetching ${contentTypeId}:`, error);
        return [];
    }
}

export async function getContentById(contentTypeId: string, contentId: string) {
    try {
        const response = await fetchAPI(
            `/cms/${SITE_ID}/content/${contentTypeId}/${contentId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

export async function searchContent(contentTypeId: string, query: string) {
    try {
        const response = await fetchAPI(
            `/cms/${SITE_ID}/content/${contentTypeId}?q=${encodeURIComponent(query)}`
        );
        return response.data?.content || [];
    } catch (error) {
        console.error('Error searching content:', error);
        return [];
    }
}

// ============================================================================
// FORM SUBMISSIONS
// ============================================================================

export async function submitContactForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    projectType?: string;
    projectSize?: string;
    description?: string;
}) {
    try {
        const response = await fetchAPI(`/cms/${SITE_ID}/form-submissions`, {
            method: 'POST',
            body: data,
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit form',
        };
    }
}

// ============================================================================
// SITE CONTENT
// ============================================================================

export async function getSiteContent() {
    try {
        const response = await fetchAPI(`/cms/${SITE_ID}/content/site-content?status=published`);
        const content = response.data?.content?.[0];
        
        if (!content) {
            // Return default values if no content exists
            return getDefaultSiteContent();
        }
        
        // Merge with defaults to ensure all fields exist (including newly added fields like stats)
        return { ...getDefaultSiteContent(), ...content.data };
    } catch (error) {
        console.error('Error fetching site content:', error);
        return getDefaultSiteContent();
    }
}

function getDefaultSiteContent() {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProjectImageUrl(project: any): string {
    return project.data?.projectImage || '/placeholder-project.jpg';
}

export function getTestimonialImageUrl(testimonial: any): string {
    return testimonial.data?.authorImage || '/placeholder-avatar.jpg';
}
