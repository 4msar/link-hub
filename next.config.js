/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        // Enables the "use cache" directive without opting the whole app
        // into cacheComponents (which conflicts with route segment configs)
        useCache: true,
        // Nudge coding agents when a Next.js security upgrade is available
        agentUpgrade: "security",
    },
    redirects: () => {
        return [
            {
                source: "/rss.xml",
                destination: "/feed",
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
