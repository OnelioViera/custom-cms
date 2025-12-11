// API client for consuming CMS endpoints
const API_URL = '/api';
const SITE_ID = 'lindsayprecast';

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
// HELPER FUNCTIONS
// ============================================================================

export function getProjectImageUrl(project: any): string {
    return project.data?.projectImage || '/placeholder-project.jpg';
}

export function getTestimonialImageUrl(testimonial: any): string {
    return testimonial.data?.authorImage || '/placeholder-avatar.jpg';
}
