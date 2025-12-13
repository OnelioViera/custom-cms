// Environment variable validation and access
// This file should be imported early in the application lifecycle


// Server-side only environment variables
const serverEnv = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SITE_ID: process.env.SITE_ID || 'lindsayprecast',
} as const;

// Public environment variables (accessible on client)
const publicEnv = {
    NEXT_PUBLIC_SITE_ID: process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
} as const;

// Validation for server-side environment
export function validateServerEnv(): void {
    const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
    const missing: string[] = [];

    for (const key of required) {
        if (!serverEnv[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env.local file.`
        );
    }
}

// Safe getters for server environment
export function getMongoUri(): string {
    if (!serverEnv.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    return serverEnv.MONGODB_URI;
}

export function getJwtSecret(): string {
    if (!serverEnv.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return serverEnv.JWT_SECRET;
}

export function getSiteId(): string {
    return serverEnv.SITE_ID;
}

// Public getters (safe for client-side)
export function getPublicSiteId(): string {
    return publicEnv.NEXT_PUBLIC_SITE_ID;
}

export function getApiUrl(): string {
    return publicEnv.NEXT_PUBLIC_API_URL;
}

// Export for convenience
export const env = {
    server: serverEnv,
    public: publicEnv,
};

