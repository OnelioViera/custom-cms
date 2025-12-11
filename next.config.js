/** @type {import('next').NextConfig} */
const nextConfig = {
    skipTrailingSlashRedirect: true,
    typescript: {
        tsconfigPath: './tsconfig.json',
    },
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['react', 'react-dom'],
    },
    // Disable static optimization for error pages
    generateBuildId: async () => {
        return 'build-' + Date.now();
    },
};

module.exports = nextConfig;
