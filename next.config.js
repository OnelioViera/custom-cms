/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance optimizations
    reactStrictMode: true,

    // Disable source maps in production for faster builds
    productionBrowserSourceMaps: false,

    // Turbopack configuration (replaces webpack config)
    turbopack: {
        // Empty config to acknowledge we're using Turbopack
        // Add loaders here if needed in the future
    },

    // Experimental features for better performance
    experimental: {
        // Optimize package imports - CRITICAL for lucide-react and tiptap
        optimizePackageImports: [
            'lucide-react',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-text-style',
            'react-image-crop',
        ],

        // Server component HMR cache for faster refresh
        serverComponentsHmrCache: true,
    },

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    // TypeScript configuration
    typescript: {
        tsconfigPath: './tsconfig.json',
    },

    // Compression
    compress: true,

    // Disable x-powered-by header
    poweredByHeader: false,

    // Generate ETags for better caching
    generateEtags: true,

    // Skip trailing slash redirect
    skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;