// Content Type Field Definitions
export interface ContentTypeField {
    fieldId: string;
    name: string;
    type: 'text' | 'number' | 'email' | 'url' | 'date' | 'select' | 'boolean' | 'textarea';
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[]; // For select fields
}

// Content Type Schema
export interface ContentType {
    _id?: string;
    siteId: string;
    contentTypeId: string;
    name: string;
    description?: string;
    fields: ContentTypeField[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Content Document
export interface Content {
    _id?: string;
    siteId: string;
    contentTypeId: string;
    contentId: string;
    title: string;
    data: Record<string, any>;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Form Submission
export interface FormSubmission {
    _id?: string;
    siteId: string;
    title: string;
    data: Record<string, any>;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    createdAt?: Date;
    updatedAt?: Date;
}

// Website Configuration
export interface Website {
    _id?: string;
    siteId: string;
    domain: string;
    name: string;
    settings?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiListResponse<T> {
    success: boolean;
    data: {
        content: T[];
        total: number;
        limit: number;
        skip: number;
    };
    error?: string;
}
