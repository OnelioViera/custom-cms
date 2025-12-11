/** @type {import('next').NextConfig} */
const nextConfig = {
    skipTrailingSlashRedirect: true,
    typescript: {
        tsconfigPath: './tsconfig.json',
    },
    reactStrictMode: true,
};

module.exports = nextConfig;
